import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/** ข่าวประชาสัมพันธ์ (Module 1 CMS) */
export const news = pgTable(
  "news",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    year: integer("year").notNull(),
    order: integer("order").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_news_year").on(table.year),
    index("idx_news_status").on(table.status),
    index("idx_news_created_at").on(table.createdAt),
  ]
);

export type NewsRow = typeof news.$inferSelect;
export type NewsInsert = typeof news.$inferInsert;
