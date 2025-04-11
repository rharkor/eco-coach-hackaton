import { logger } from "@rharkor/logger";

import { qdrantClient } from "./index";

const COLLECTION_NAME = "embeddings";

const initializeQdrant = async () => {
  logger.info("⏳ Initializing Qdrant...");

  try {
    const collections = await qdrantClient.getCollections();

    if (
      !collections.collections.some(
        (c: { name: string }) => c.name === COLLECTION_NAME
      )
    ) {
      logger.subLog(`Creating collection: ${COLLECTION_NAME}`);

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

      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: "userId",
        field_schema: "keyword",
      });

      logger.success("✅ Collection created successfully");
    } else {
      logger.subLog(`Collection ${COLLECTION_NAME} already exists`);
    }

    logger.success("✅ Qdrant initialized successfully");
  } catch (error) {
    logger.error("❌ Failed to initialize Qdrant");
    logger.error(error);
    process.exit(1);
  }

  process.exit(0);
};

initializeQdrant().catch((err) => {
  logger.error("❌ Initialization failed");
  logger.error(err);
  process.exit(1);
});
