import { EmbeddingsInterface } from '@langchain/core/embeddings';
import { MongoDBAtlasVectorSearch, MongoDBStore } from '@langchain/mongodb';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Collection } from 'mongodb';
import { Connection } from 'mongoose';

@Injectable()
export class MongoDBStoreService {
  constructor(@InjectConnection() private connection: Connection) {}

  async getStore(collectionName: string) {
    return new MongoDBStore({
      collection: this.connection.collection(
        collectionName,
      ) as unknown as Collection,
    });
  }

  async getVectorStore(
    embeddingService: EmbeddingsInterface,
    collectionName: string,
    indexName: string,
  ) {
    return new MongoDBAtlasVectorSearch(embeddingService, {
      collection: this.connection.collection(
        collectionName,
      ) as unknown as Collection,
      indexName,
    });
  }
}
