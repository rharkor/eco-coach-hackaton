import { qdrantClient } from "./index";
import { env } from "@/lib/env.mjs";

const COLLECTION_NAME = "embeddings";

const initializeQdrant = async () => {
  console.log("⏳ Initializing Qdrant...");

  try {
    const collections = await qdrantClient.getCollections();

    if (
      !collections.collections.some(
        (c: { name: string }) => c.name === COLLECTION_NAME
      )
    ) {
      console.log(`Creating collection: ${COLLECTION_NAME}`);

      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 1536, // OpenAI Ada-002 embedding size
          distance: "Cosine",
        },
      });

      // Add payload index for content field
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: "content",
        field_schema: "keyword",
      });

      // Add payload index for resourceId
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: "resourceId",
        field_schema: "keyword",
      });

      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: "userId",
        field_schema: "keyword",
      });

      console.log("✅ Collection created successfully");
    } else {
      console.log(`Collection ${COLLECTION_NAME} already exists`);
    }

    console.log("✅ Qdrant initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Qdrant");
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
};

initializeQdrant().catch((err) => {
  console.error("❌ Initialization failed");
  console.error(err);
  process.exit(1);
});
