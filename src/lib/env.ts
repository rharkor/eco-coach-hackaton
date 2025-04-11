/* eslint-disable no-process-env */
import { z } from "zod";

import { createEnv } from "@t3-oss/env-nextjs";

import "dotenv/config";

export const env = createEnv({
  server: {
    ENV: z.enum(["development", "test", "production"]),
    LOGGER_ENV: z.enum(["development", "test", "production"]),
    QDRANT_URL: z.string().min(1),
    DATABASE_URL: z.string().min(1),
  },
  client: {},
  experimental__runtimeEnv: {
    ENV: process.env.ENV,
    LOGGER_LEVEL: process.env.LOGGER_LEVEL,
    LOGGER_ENV: process.env.LOGGER_ENV,
    QDRANT_URL: process.env.QDRANT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  },
});
