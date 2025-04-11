import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const challengeKind = pgEnum("challenge_kind", ["daily", "other"]);

export const challengeTable = pgTable("challenge", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  score: integer("score").notNull(),
  kgCO2Saved: integer("kg_co2_saved").notNull().default(0),
  hasBeenCompleted: boolean("has_been_completed").notNull().default(false),
  kind: challengeKind("kind").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
