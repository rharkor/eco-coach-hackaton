"use server";

import { qdrantClient } from "../db";
import {
  generateEmbeddings,
  initializeQdrantCollection,
} from "../ai/embedding";
import { nanoid } from "@/lib/utils";
import { z } from "zod";

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

    // Generate a unique ID for the resource
    const resourceId = nanoid();

    // Store in Qdrant directly - no need for separate DB
    const embeddings = await generateEmbeddings(content);

    // Use batch upload points
    console.log(
      "upserting embeddings",
      embeddings.map((e) => e.content)
    );
    await qdrantClient.upsert(COLLECTION_NAME, {
      points: embeddings.map((embedding) => ({
        id: crypto.randomUUID(),
        vector: embedding.embedding,
        payload: {
          resourceId: resourceId,
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
