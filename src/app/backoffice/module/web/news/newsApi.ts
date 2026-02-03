/**
 * Client API สำหรับข่าวประชาสัมพันธ์ (เชื่อมกับ PostgreSQL ผ่าน /api/news)
 */

export type NewsStatus = "draft" | "published";

export type NewsItem = {
  id: string;
  title: string;
  content: string;
  year: number;
  order: number;
  status: NewsStatus;
  createdAt: string;
  updatedAt?: string | null;
};

const BASE = "/api/news";

async function handleRes<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : res.statusText);
  }
  return data as T;
}

export async function loadNews(): Promise<NewsItem[]> {
  const res = await fetch(BASE);
  return handleRes<NewsItem[]>(res);
}

export async function createNews(payload: {
  title: string;
  content: string;
  year: number;
  order: number;
  status: NewsStatus;
}): Promise<NewsItem> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleRes<NewsItem>(res);
}

export async function updateNews(
  id: string,
  patch: Partial<Omit<NewsItem, "id" | "createdAt">>
): Promise<NewsItem> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return handleRes<NewsItem>(res);
}

export async function deleteNews(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  await handleRes<{ ok: boolean }>(res);
}
