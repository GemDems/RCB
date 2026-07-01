import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const allowedDomainsTable = pgTable("allowed_domains", {
  id: serial("id").primaryKey(),
  domain: text("domain").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AllowedDomain = typeof allowedDomainsTable.$inferSelect;
export type InsertAllowedDomain = typeof allowedDomainsTable.$inferInsert;
