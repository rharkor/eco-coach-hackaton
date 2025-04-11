"use server";

import { z } from "zod";

import {
  generateEmbeddings,
  initializeQdrantCollection,
} from "../ai/embedding";
import { qdrantClient } from "../qdrant";

const COLLECTION_NAME = "embeddings";

export const createResource = async (input: {
  content: string;
  userId: string;
}) => {
  try {
    const { content, userId } = z
      .object({ content: z.string(), userId: z.string() })
      .parse(input);

    // Ensure the collection exists
    await initializeQdrantCollection();

    // Store in Qdrant directly - no need for separate DB
    const embeddings = await generateEmbeddings(content);

    // Use batch upload points
    await qdrantClient.upsert(COLLECTION_NAME, {
      points: embeddings.map((embedding) => ({
        id: crypto.randomUUID(),
        vector: embedding.embedding,
        payload: {
          userId,
          content: embedding.content,
          createdAt: new Date().toISOString(),
        },
      })),
    });

    return "Resource successfully created and embedded.";
  } catch (e) {
    console.error(e);
    if (e instanceof Error)
      return e.message.length > 0 ? e.message : "Error, please try again.";
  }
};
