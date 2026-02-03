import { desc, asc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { news } from "./db/schema";

export type NewsStatus = "draft" | "published";

export type NewsRow = {
  id: string;
  title: string;
  content: string;
  year: number;
  order: number;
  status: NewsStatus;
  createdAt: string;
  updatedAt: string | null;
};

function rowToItem(
  r: {
    id: string;
    title: string;
    content: string;
    year: number;
    order: number;
    status: string;
    createdAt: Date;
    updatedAt: Date | null;
  }
): NewsRow {
  return {
    id: r.id,
    title: r.title,
    content: r.content,
    year: r.year,
    order: r.order,
    status: r.status as NewsStatus,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
  };
}

export async function listNews(): Promise<NewsRow[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(news)
    .orderBy(desc(news.year), asc(news.order), desc(news.createdAt));
  return rows.map(rowToItem);
}

export async function getNewsById(id: string): Promise<NewsRow | null> {
  const db = getDb();
  const rows = await db.select().from(news).where(eq(news.id, id));
  if (rows.length === 0) return null;
  return rowToItem(rows[0]);
}

export async function createNews(payload: {
  title: string;
  content: string;
  year: number;
  order: number;
  status: NewsStatus;
}): Promise<NewsRow> {
  const db = getDb();
  const rows = await db
    .insert(news)
    .values({
      title: payload.title,
      content: payload.content,
      year: payload.year,
      order: payload.order,
      status: payload.status,
    })
    .returning();
  return rowToItem(rows[0]);
}

export async function updateNews(
  id: string,
  patch: {
    title?: string;
    content?: string;
    year?: number;
    order?: number;
    status?: NewsStatus;
  }
): Promise<NewsRow | null> {
  const existing = await getNewsById(id);
  if (!existing) return null;

  const db = getDb();
  const rows = await db
    .update(news)
    .set({
      title: patch.title ?? existing.title,
      content: patch.content ?? existing.content,
      year: patch.year ?? existing.year,
      order: patch.order ?? existing.order,
      status: patch.status ?? existing.status,
      updatedAt: new Date(),
    })
    .where(eq(news.id, id))
    .returning();
  if (rows.length === 0) return null;
  return rowToItem(rows[0]);
}

export async function deleteNews(id: string): Promise<boolean> {
  const db = getDb();
  const result = await db.delete(news).where(eq(news.id, id));
  return (result.rowCount ?? 0) > 0;
}
