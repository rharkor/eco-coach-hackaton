import { embed, embedMany } from "ai";

import { openai } from "@ai-sdk/openai";

import { qdrantClient } from "../qdrant";

const embeddingModel = openai.embedding("text-embedding-ada-002");
const COLLECTION_NAME = "embeddings";

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "");
};

export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (
  userQuery: string,
  userId: string
) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);

  const searchResult = await qdrantClient.search(COLLECTION_NAME, {
    vector: userQueryEmbedded,
    limit: 4,
    score_threshold: 0.5,
    filter: {
      must: [{ key: "userId", match: { value: userId } }],
    },
  });

  return searchResult.map((hit) => ({
    name: hit.payload?.content as string,
    similarity: hit.score,
  }));
};

// Initialize collection if it doesn't exist
export const initializeQdrantCollection = async () => {
  try {
    const collections = await qdrantClient.getCollections();

    if (
      !collections.collections.some(
        (c: { name: string }) => c.name === COLLECTION_NAME
      )
    ) {
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 1536,
          distance: "Cosine",
        },
      });

      // Add payload index for content field
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: "content",
        field_schema: "keyword",
      });
    }
  } catch (error) {
    console.error("Failed to initialize Qdrant collection:", error);
  }
};
