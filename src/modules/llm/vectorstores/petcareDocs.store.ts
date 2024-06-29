import { TaskType } from '@google/generative-ai';
import { Document } from '@langchain/core/documents';
import { Injectable } from '@nestjs/common';
import { MultiVectorRetriever } from 'langchain/retrievers/multi_vector';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { createSHA256 } from 'src/common/utils/converter';
import { v4 as uuidv4 } from 'uuid';

import { GooleGenAIService } from '../googleServices/googleGenAI.service';
import { MongoDBStoreService } from './mongodb.store.service';

/**
 * This class is aimed to upload and process documents loaded from document loader into vector store and document store
 * It uses Parent-child document upload strategy in order to get better search result and larger context frame in return
 * https://js.langchain.com/v0.2/docs/how_to/multi_vector/
 *
 * VECTOR_STORE_INDEX_NAME is the most essential part to make the query works
 * Follow below instructions to create vector index with the specified name for VECTOR_STORE_INDEX_NAME in this file
 * https://js.langchain.com/v0.1/docs/integrations/vectorstores/mongodb_atlas/#creating-an-index
 * https://www.mongodb.com/developer/products/atlas/building-generative-ai-applications-vector-search-open-source-models/
 * https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-type/
 *
 */
@Injectable()
export class PetcareDocsStore {
  private readonly CHILD_CHUNK_OVERLAP = 50;
  private readonly CHILD_CHUNK_SIZE = 400;
  private readonly CHILD_K = 20;
  private ID_KEY = 'main_chunk_id';

  private readonly MAIN_CHUNK_OVERLAP = 100;
  private readonly MAIN_CHUNK_SIZE = 1_800;
  private readonly MAIN_CHUNK_STORE_COLLECTION_NAME =
    'petcare-docs-main-chunks';
  private readonly MAIN_K = 5;

  private readonly VECTOR_STORE_COLLECTION_NAME = 'petcare-docs-child-chunks';
  private readonly VECTOR_STORE_INDEX_NAME =
    'petcare-child-chunks-vector-index';

  constructor(
    private readonly mongodbStoreService: MongoDBStoreService,
    private readonly googleGenAIService: GooleGenAIService,
  ) {}

  private getChildChunksSplitter() {
    return new RecursiveCharacterTextSplitter({
      /**
       * TODO: Adjust these value to get better similarity search result
       */
      chunkOverlap: this.CHILD_CHUNK_OVERLAP,
      chunkSize: this.CHILD_CHUNK_SIZE,
    });
  }

  private async getEmbeddingModel(subject?: string) {
    return await this.googleGenAIService.getEmbeddingModel(
      TaskType.RETRIEVAL_DOCUMENT,
      'embedding-001',
      subject,
    );
  }

  /**
   * The byteStore to use to store the original chunks
   */
  private async getMainChunkStore() {
    return this.mongodbStoreService.getStore(
      this.MAIN_CHUNK_STORE_COLLECTION_NAME,
    );
  }

  private getMainChunksSplitter() {
    return new RecursiveCharacterTextSplitter({
      /**
       * TODO: Adjust these value to get better context frame
       */
      chunkOverlap: this.MAIN_CHUNK_OVERLAP,
      chunkSize: this.MAIN_CHUNK_SIZE,
    });
  }

  /**
   * The vectorstore to use to index the child chunks
   * @param uploadingContentSubject subject of the document to be uploaded
   * @returns
   */
  private async getVectorStore(uploadedContentSubject: string) {
    return this.mongodbStoreService.getVectorStore(
      await this.getEmbeddingModel(uploadedContentSubject),
      this.VECTOR_STORE_COLLECTION_NAME,
      this.VECTOR_STORE_INDEX_NAME,
    );
  }

  private removeNewLines(str: string) {
    return str.replace(/[\r\n]+/gm, ' ');
  }

  /**
   * Add the loaded document result from document loader into vector store and main chunk store
   * @param uploadedContentSubject subject to the uploaded document
   * @param documents loaded document from document loadder
   */
  public async addDocuments(
    uploadedContentSubject: string,
    documents: Document[],
  ) {
    // Split for main chunks
    const docs = (
      await this.getMainChunksSplitter().splitDocuments(documents)
    ).map(
      (doc) => (
        (doc.metadata['sha256'] = createSHA256(
          Buffer.from(JSON.stringify(doc)),
        )),
        (doc.pageContent = this.removeNewLines(doc.pageContent)),
        doc
      ),
    );

    // Create id to map child to main chunks
    const docIds = docs.map((_) => uuidv4());

    // Prepare to split to sub documents => vectorstore
    const subDocs = [];

    for (let i = 0; i < docs.length; i += 1) {
      const childDocs = (
        await this.getChildChunksSplitter().splitDocuments([docs[i]])
      ).map(
        (doc) => (
          (doc.metadata['sha256'] = createSHA256(
            Buffer.from(JSON.stringify(doc)),
          )),
          (doc.metadata[this.ID_KEY] = docIds[i]),
          doc
        ),
      );

      subDocs.push(...childDocs);
    }

    // Store sub docs to vector store
    await (
      await this.getVectorStore(uploadedContentSubject)
    ).addDocuments(subDocs);

    const keyValuePairs: [string, Document][] = docs.map((originalDoc, i) => [
      docIds[i],
      originalDoc,
    ]);

    // Use the retriever to add the original chunks to the document store
    await (
      await this.getRetriever(uploadedContentSubject)
    ).docstore.mset(keyValuePairs);
  }

  /**
   * Main retriever to get original chunks from MainChunkStore
   * @param uploadedContentSubject
   * @returns
   */
  public async getRetriever(uploadedContentSubject?: string) {
    return new MultiVectorRetriever({
      byteStore: await this.getMainChunkStore(),
      // retrieved, as multiple child documents can point to the same parent.
      childK: this.CHILD_K,
      idKey: this.ID_KEY,
      // Optional `k` parameter to search for more child documents in VectorStore.
      // Note that this does not exactly correspond to the number of final (parent) documents
      // retriever and sent to LLM. This is an upper-bound, and the final count may be lower than this.
      parentK: this.MAIN_K,
      // Optional `k` parameter to limit number of final, parent documents returned from this
      vectorstore: await this.getVectorStore(uploadedContentSubject),
    });
  }
}
