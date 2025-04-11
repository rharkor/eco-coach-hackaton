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

// Environment variables utility
// Safely access environment variables on the server side

export const getEnv = (key: string, defaultValue: string): string => {
  // This module should only be imported in server components or API routes
  // It will throw an error if used in client components
  if (typeof process === "undefined" || typeof process.env === "undefined") {
    throw new Error(
      "Environment variables can only be accessed in server components or API routes"
    );
  }

  return process.env[key] || defaultValue;
};

// Redis configuration
export const REDIS_HOST = getEnv("REDIS_HOST", "localhost");
export const REDIS_PORT = parseInt(getEnv("REDIS_PORT", "6379"), 10);
