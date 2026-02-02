export type NewsStatus = "draft" | "published";

export type NewsItem = {
  id: string;
  title: string;
  content: string;
  year: number;
  order: number;
  status: NewsStatus;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
};

const STORAGE_KEY = "backoffice.cms.news.v1";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function seed(): NewsItem[] {
  const now = nowIso();
  return [
    {
      id: uid(),
      title: "ประกาศตัวอย่าง: เปิดรับสมัครอบรมวิชาชีพ",
      content: "นี่คือข่าวตัวอย่างสำหรับทดสอบหน้าจัดการข่าวประชาสัมพันธ์",
      year: new Date().getFullYear(),
      order: 1,
      status: "published",
      createdAt: now,
    },
    {
      id: uid(),
      title: "ข่าวตัวอย่าง: กำหนดการประชุมประจำเดือน",
      content: "รายละเอียดกำหนดการประชุม (ตัวอย่าง)",
      year: new Date().getFullYear(),
      order: 2,
      status: "draft",
      createdAt: now,
    },
  ];
}

export function loadNews(): NewsItem[] {
  if (typeof window === "undefined") return [];

  const parsed = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (Array.isArray(parsed) && parsed.length > 0) return parsed as NewsItem[];

  // first run: seed
  const initial = seed();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function saveNews(items: NewsItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function createNews(input: Omit<NewsItem, "id" | "createdAt" | "updatedAt">) {
  const items = loadNews();
  const next: NewsItem = {
    ...input,
    id: uid(),
    createdAt: nowIso(),
  };
  const updated = [next, ...items];
  saveNews(updated);
  return updated;
}

export function updateNews(
  id: string,
  patch: Partial<Omit<NewsItem, "id" | "createdAt">>
) {
  const items = loadNews();
  const updated = items.map((it) =>
    it.id === id ? { ...it, ...patch, updatedAt: nowIso() } : it
  );
  saveNews(updated);
  return updated;
}

export function deleteNews(id: string) {
  const items = loadNews();
  const updated = items.filter((it) => it.id !== id);
  saveNews(updated);
  return updated;
}

