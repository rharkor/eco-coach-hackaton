import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "@/lib/env.mjs";

const QDRANT_URL = env.QDRANT_URL || "http://localhost:6333";

export const qdrantClient = new QdrantClient({ url: QDRANT_URL });
