import Redis from "ioredis";

import { REDIS_HOST, REDIS_PORT } from "@/lib/env";

// Create a Redis client - only used server-side
const createRedisClient = () => {
  // Make sure we don't create Redis clients in client components
  if (typeof window !== "undefined") {
    throw new Error("Redis client cannot be used in client components");
  }

  return new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: 3,
  });
};

// Export Redis client (lazy initialization)
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

// Function to get data from cache with TTL
export async function getWithTTL<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds = 3600
): Promise<T> {
  try {
    const redis = getRedisClient();
    // Try to get data from cache
    const cachedData = await redis.get(key);

    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }

    // If not in cache, fetch the data
    const data = await fetchFn();

    // Store in cache with TTL
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);

    return data;
  } catch (error) {
    console.error(`Redis cache error for key ${key}:`, error);
    // Fall back to fetching data directly if cache fails
    return fetchFn();
  }
}
