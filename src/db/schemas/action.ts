import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const actionTable = pgTable("action", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
