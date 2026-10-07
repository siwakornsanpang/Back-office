import { authFetch } from '@/app/utils/authFetch';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
export interface AcademyCourse {
  id: number; title: string; summary: string | null;
  instructorId: number | null; instructorName: string | null;
  coverUrl: string | null; durationLabel: string | null;
  cpeCredits: string | number; price: string | number;
  status: 'draft' | 'published' | 'archived';
  categoryId: number | null; categoryName: string | null; createdAt?: string;
}
export interface AcademyPage<T> { items: T[]; page: number; limit: number; total: number }
export interface AcademyCourseInput {
  title: string; categoryName: string; summary: string; instructorName: string;
  coverUrl: string; durationLabel: string; cpeCredits: number; price: number;
  status: 'draft' | 'published' | 'archived';
}
export interface AcademyCourseEnrollment {
  id: number; displayName: string; pharmacistLicense: string | null;
  enrolledAt: string; status: 'active' | 'cancelled';
}
export class AcademyApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}
const COVER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_COVER_SIZE = 5 * 1024 * 1024;
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new AcademyApiError('ไม่ได้ตั้งค่า NEXT_PUBLIC_API_URL', 0);
  const response = await authFetch(`${API_URL}/academy/${path.replace(/^\/+/, '')}`, init);
  if (!response.ok) {
    let message = 'ไม่สามารถบันทึกข้อมูล Pharmacy Academy ได้';
    try {
      const body = await response.json() as { message?: string };
      if (body.message) message = body.message;
    } catch { /* use fallback */ }
    throw new AcademyApiError(message, response.status);
  }
  return response.json() as Promise<T>;
}
export async function uploadAcademyCover(file: File): Promise<string> {
  if (!COVER_TYPES.has(file.type)) {
    throw new AcademyApiError('รองรับเฉพาะรูป JPG, PNG หรือ WebP', 400);
  }
  if (file.size > MAX_COVER_SIZE) {
    throw new AcademyApiError('รูปภาพต้องมีขนาดไม่เกิน 5 MB', 400);
  }
  const data = new FormData();
  data.append('file', file);
  const result = await request<{ url: string }>('admin/upload', { method: 'POST', body: data });
  if (!result.url) throw new AcademyApiError('อัปโหลดรูปภาพไม่สำเร็จ', 500);
  return result.url;
}
type NamedRecord = { id: number; name: string };
export async function listAcademyChoices(): Promise<{ categories: string[]; instructors: string[] }> {
  const [categories, instructors] = await Promise.all([
    request<NamedRecord[]>('admin/categories'),
    request<NamedRecord[]>('admin/instructors'),
  ]);
  return {
    categories: categories.map((item) => item.name),
    instructors: instructors.map((item) => item.name),
  };
}
async function resolveNamedId(kind: 'categories' | 'instructors', name: string): Promise<number | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const records = await request<NamedRecord[]>(`admin/${kind}`);
  const existing = records.find((item) => item.name.trim().toLocaleLowerCase() === trimmed.toLocaleLowerCase());
  if (existing) return existing.id;
  const created = await request<{ data: NamedRecord }>(`admin/${kind}`, {
    method: 'POST', body: JSON.stringify({ name: trimmed }),
  });
  return created.data.id;
}
export async function listAdminCourses(params: { search?: string; status?: string; page?: number; limit?: number } = {}): Promise<AcademyPage<AcademyCourse>> {
  const rows = await request<AcademyCourse[]>('admin/courses');
  const search = params.search?.trim().toLocaleLowerCase();
  const filtered = rows.filter((course) =>
    (!params.status || course.status === params.status)
    && (!search || [course.title, course.instructorName, course.categoryName].some((value) => value?.toLocaleLowerCase().includes(search))),
  );
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 20);
  return { items: filtered.slice((page - 1) * limit, page * limit), page, limit, total: filtered.length };
}
export async function listAllAdminCourses() {
  return request<AcademyCourse[]>('admin/courses');
}
export async function getAdminCourse(id: number): Promise<AcademyCourse> {
  const [course, categories, instructors] = await Promise.all([
    request<AcademyCourse>(`admin/courses/${id}`),
    request<NamedRecord[]>('admin/categories'),
    request<NamedRecord[]>('admin/instructors'),
  ]);
  return {
    ...course,
    categoryName: categories.find((item) => item.id === course.categoryId)?.name ?? null,
    instructorName: instructors.find((item) => item.id === course.instructorId)?.name ?? null,
  };
}
export async function saveAdminCourse(input: AcademyCourseInput, id?: number): Promise<AcademyCourse> {
  const [categoryId, instructorId] = await Promise.all([
    resolveNamedId('categories', input.categoryName),
    resolveNamedId('instructors', input.instructorName),
  ]);
  const body = {
    title: input.title.trim(), summary: input.summary.trim(),
    coverUrl: input.coverUrl.trim() || null, durationLabel: input.durationLabel.trim() || null,
    cpeCredits: input.cpeCredits, price: input.price, status: input.status,
    categoryId, instructorId,
  };
  const result = await request<{ data: AcademyCourse }>(id ? `admin/courses/${id}` : 'admin/courses', {
    method: id ? 'PUT' : 'POST', body: JSON.stringify(body),
  });
  return result.data;
}
export async function listCourseEnrollments(courseId: number, params: { search?: string; page?: number; limit?: number } = {}): Promise<AcademyPage<AcademyCourseEnrollment>> {
  const query = new URLSearchParams({ courseId: String(courseId), page: String(params.page ?? 1), pageSize: String(params.limit ?? 20) });
  if (params.search?.trim()) query.set('q', params.search.trim());
  const result = await request<{ items: AcademyCourseEnrollment[]; total: number; page: number; pageSize: number }>(`admin/enrollments?${query}`);
  return { items: result.items, total: result.total, page: result.page, limit: result.pageSize };
}
