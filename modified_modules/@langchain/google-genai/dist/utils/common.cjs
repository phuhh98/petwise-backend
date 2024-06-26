"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToGenerativeAITools = exports.convertResponseContentToChatGenerationChunk = exports.mapGenerateContentResultToChatResult = exports.convertBaseMessagesToContent = exports.convertMessageContentToParts = exports.convertAuthorToRole = exports.getMessageAuthor = void 0;
const messages_1 = require("@langchain/core/messages");
const outputs_1 = require("@langchain/core/outputs");
const function_calling_1 = require("@langchain/core/utils/function_calling");
const zod_to_genai_parameters_js_1 = require("./zod_to_genai_parameters.cjs");
function getMessageAuthor(message) {
    const type = message._getType();
    if (messages_1.ChatMessage.isInstance(message)) {
        return message.role;
    }
    return message.name ?? type;
}
exports.getMessageAuthor = getMessageAuthor;
/**
 * Maps a message type to a Google Generative AI chat author.
 * @param message The message to map.
 * @param model The model to use for mapping.
 * @returns The message type mapped to a Google Generative AI chat author.
 */
function convertAuthorToRole(author) {
    switch (author) {
        /**
         *  Note: Gemini currently is not supporting system messages
         *  we will convert them to human messages and merge with following
         * */
        case "ai":
        case "model": // getMessageAuthor returns message.name. code ex.: return message.name ?? type;
            return "model";
        case "system":
        case "human":
            return "user";
        default:
            throw new Error(`Unknown / unsupported author: ${author}`);
    }
}
exports.convertAuthorToRole = convertAuthorToRole;
function messageContentMedia(content) {
    if ("mimeType" in content && "data" in content) {
        return {
            inlineData: {
                mimeType: content.mimeType,
                data: content.data,
            },
        };
    }
    if ("mimeType" in content && "fileUri" in content){
        return  {
                fileData: {
                  mimeType: content.mimeType,
                  fileUri: content.fileUri
                }
              }
    }
    throw new Error("Invalid media content");
}
function convertMessageContentToParts(content, isMultimodalModel) {
    if (typeof content === "string") {
        return [{ text: content }];
    }
    return content.map((c) => {
        if (c.type === "text") {
            return {
                text: c.text,
            };
        }
        if (c.type === "image_url") {
            if (!isMultimodalModel) {
                throw new Error(`This model does not support images`);
            }
            let source;
            if (typeof c.image_url === "string") {
                source = c.image_url;
            }
            else if (typeof c.image_url === "object" && "url" in c.image_url) {
                source = c.image_url.url;
            }
            else {
                throw new Error("Please provide image as base64 encoded data URL");
            }
            const [dm, data] = source.split(",");
            if (!dm.startsWith("data:")) {
                throw new Error("Please provide image as base64 encoded data URL");
            }
            const [mimeType, encoding] = dm.replace(/^data:/, "").split(";");
            if (encoding !== "base64") {
                throw new Error("Please provide image as base64 encoded data URL");
            }
            return {
                inlineData: {
                    data,
                    mimeType,
                },
            };
        }
        else if (c.type === "media") {
            return messageContentMedia(c);
        }
        throw new Error(`Unknown content type ${c.type}`);
    });
}
exports.convertMessageContentToParts = convertMessageContentToParts;
function convertBaseMessagesToContent(messages, isMultimodalModel) {
    return messages.reduce((acc, message, index) => {
        if (!(0, messages_1.isBaseMessage)(message)) {
            throw new Error("Unsupported message input");
        }
        const author = getMessageAuthor(message);
        if (author === "system" && index !== 0) {
            throw new Error("System message should be the first one");
        }
        const role = convertAuthorToRole(author);
        const prevContent = acc.content[acc.content.length];
        if (!acc.mergeWithPreviousContent &&
            prevContent &&
            prevContent.role === role) {
            throw new Error("Google Generative AI requires alternate messages between authors");
        }
        const parts = convertMessageContentToParts(message.content, isMultimodalModel);
        if (acc.mergeWithPreviousContent) {
            const prevContent = acc.content[acc.content.length - 1];
            if (!prevContent) {
                throw new Error("There was a problem parsing your system message. Please try a prompt without one.");
            }
            prevContent.parts.push(...parts);
            return {
                mergeWithPreviousContent: false,
                content: acc.content,
            };
        }
        const content = {
            role,
            parts,
        };
        return {
            mergeWithPreviousContent: author === "system",
            content: [...acc.content, content],
        };
    }, { content: [], mergeWithPreviousContent: false }).content;
}
exports.convertBaseMessagesToContent = convertBaseMessagesToContent;
function mapGenerateContentResultToChatResult(response) {
    // if rejected or error, return empty generations with reason in filters
    if (!response.candidates ||
        response.candidates.length === 0 ||
        !response.candidates[0]) {
        return {
            generations: [],
            llmOutput: {
                filters: response.promptFeedback,
            },
        };
    }
    const functionCalls = response.functionCalls();
    const [candidate] = response.candidates;
    const { content, ...generationInfo } = candidate;
    const text = content?.parts[0]?.text ?? "";
    const generation = {
        text,
        message: new messages_1.AIMessage({
            content: text,
            tool_calls: functionCalls,
            additional_kwargs: {
                ...generationInfo,
            },
        }),
        generationInfo,
    };
    return {
        generations: [generation],
    };
}
exports.mapGenerateContentResultToChatResult = mapGenerateContentResultToChatResult;
function convertResponseContentToChatGenerationChunk(response) {
    if (!response.candidates || response.candidates.length === 0) {
        return null;
    }
    const [candidate] = response.candidates;
    const { content, ...generationInfo } = candidate;
    const text = content?.parts[0]?.text ?? "";
    return new outputs_1.ChatGenerationChunk({
        text,
        message: new messages_1.AIMessageChunk({
            content: text,
            name: !content ? undefined : content.role,
            // Each chunk can have unique "generationInfo", and merging strategy is unclear,
            // so leave blank for now.
            additional_kwargs: {},
        }),
        generationInfo,
    });
}
exports.convertResponseContentToChatGenerationChunk = convertResponseContentToChatGenerationChunk;
function convertToGenerativeAITools(structuredTools) {
    if (structuredTools.every((tool) => "functionDeclarations" in tool &&
        Array.isArray(tool.functionDeclarations))) {
        return structuredTools;
    }
    return [
        {
            functionDeclarations: structuredTools.map((structuredTool) => {
                if ((0, function_calling_1.isStructuredTool)(structuredTool)) {
                    const jsonSchema = (0, zod_to_genai_parameters_js_1.zodToGenerativeAIParameters)(structuredTool.schema);
                    return {
                        name: structuredTool.name,
                        description: structuredTool.description,
                        parameters: jsonSchema,
                    };
                }
                return structuredTool;
            }),
        },
    ];
}
exports.convertToGenerativeAITools = convertToGenerativeAITools;
