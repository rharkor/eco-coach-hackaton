import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const challengeKind = pgEnum("challenge_kind", ["daily", "other"]);

export default pgTable("challenge", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  score: integer("score").notNull(),
  hasBeenCompleted: boolean("has_been_completed").notNull().default(false),
  kind: challengeKind("kind").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
