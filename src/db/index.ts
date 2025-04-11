import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "@/lib/env";

import "dotenv/config";

const db = drizzle(env.DATABASE_URL);

export default db;
