'use client';

import { useParams } from 'next/navigation';
import CourseEditor from '../../../CourseEditor';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  if (!Number.isInteger(courseId) || courseId < 1) return <main>ไม่พบคอร์ส</main>;
  return <CourseEditor courseId={courseId} />;
}
