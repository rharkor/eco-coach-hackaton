import { faker } from "@faker-js/faker";
import crypto from "crypto";
import {
  generateEmbeddings,
  initializeQdrantCollection,
} from "../ai/embedding";
import { qdrantClient } from ".";

const COLLECTION_NAME = "embeddings";
const NUM_USERS = 1000;

type Embedding = {
  content: string;
  embedding: number[];
  userId: string;
};

const interestPool = [
  "AI art",
  "mindfulness",
  "crossfit",
  "astrology",
  "day trading",
  "sourdough baking",
  "climate activism",
  "space exploration",
  "k-pop",
  "biohacking",
  "vegan cooking",
  "home automation",
  "anime",
  "digital nomadism",
];

const chunk = <T>(array: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, (i + 1) * size)
  );
};

/**
 * Executes a function in parallel on each item of an array, with a specified number of parallel threads.
 *
 * @template T - The type of elements in the array.
 * @template R - The type of the result of the function.
 * @param {T[]} array - The array of items to process.
 * @param {(item: T) => Promise<R>} fn - The function to execute on each item, which returns a promise.
 * @param {number} parallelThreads - The number of parallel threads to use.
 * @returns {Promise<R[]>} A promise that resolves to an array of results.
 */
export const executeInParallel = async <T, R>(
  array: T[],
  fn: (item: T, index: number) => Promise<R>,
  parallelThreads: number = 10
): Promise<(R extends readonly (infer InnerArr)[] ? InnerArr : R)[]> => {
  const chunks = chunk(array, parallelThreads);
  const results: R[] = [];

  let chunkIndex = 0;
  for (const chunk of chunks) {
    const promises = chunk.map((item, index) =>
      fn(item, chunkIndex * parallelThreads + index)
    );
    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
    chunkIndex++;
  }

  const flattenedResults = results.flat();
  return flattenedResults;
};

export const generateRichUserProfile = (userId: string) => {
  const name = faker.person.fullName();
  const age = faker.number.int({ min: 18, max: 60 });
  const job = `${faker.person.jobTitle()} at ${faker.company.name()}`;
  const currentMood = faker.hacker.phrase();
  const interests = faker.helpers.arrayElements(
    interestPool,
    faker.number.int({ min: 2, max: 5 })
  );
  const recentActivity = faker.lorem.sentence();
  const lifeGoal = faker.lorem.sentence();

  return {
    userId,
    name,
    age,
    job,
    currentMood,
    interests,
    recentActivity,
    lifeGoal,
  };
};

const seedQdrant = async () => {
  console.log(`Initializing collection "${COLLECTION_NAME}"...`);
  await initializeQdrantCollection();
  console.log(`Collection "${COLLECTION_NAME}" initialized`);

  let totalInserted = 0;

  const userIds = Array.from({ length: NUM_USERS }, () => crypto.randomUUID());
  await executeInParallel(
    userIds,
    async (userId) => {
      console.log(`Generating user ${userId}`);
      const input = generateRichUserProfile(userId);

      const allEmbeddings: Embedding[] = [];
      const embeddings = await generateEmbeddings(
        Object.entries(input)
          .map(([key, value]) => `${key}: ${value}`)
          .join(".")
      );
      allEmbeddings.push(
        ...embeddings.map((e) => ({
          ...e,
          userId,
        }))
      );

      console.log(`Upserting ${allEmbeddings.length} embeddings...`);
      const points = allEmbeddings.map((embedding) => ({
        id: crypto.randomUUID(),
        vector: embedding.embedding,
        payload: {
          userId: embedding.userId,
          content: embedding.content,
          createdAt: new Date().toISOString(),
        },
      }));

      await qdrantClient.upsert(COLLECTION_NAME, { points });
      totalInserted += points.length;
    },
    100
  );

  console.log(
    `✅ Finished seeding ${totalInserted} fake user info into Qdrant.`
  );
};

seedQdrant().catch((err) => {
  console.error("Seeding failed:", err);
});
