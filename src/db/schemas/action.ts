import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const actionTable = pgTable("action", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  score: integer("score").notNull(),
  kgCO2Saved: integer("kg_co2_saved").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
