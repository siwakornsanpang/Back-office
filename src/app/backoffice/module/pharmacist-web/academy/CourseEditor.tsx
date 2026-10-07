'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ImagePlus, Save, Trash2, UploadCloud } from 'lucide-react';
import PageHeader from '@/app/components/ui/PageHeader';
import styles from './academy.module.css';
import { AcademyApiError, AcademyCourseInput, getAdminCourse, listAcademyChoices, saveAdminCourse, uploadAcademyCover } from './academyApi';

const COURSE_LIST = '/backoffice/module/pharmacist-web/academy/courses';
const emptyCourse: AcademyCourseInput = {
  title: '', categoryName: '', summary: '', instructorName: '', coverUrl: '',
  durationLabel: '', cpeCredits: 0, price: 0, status: 'draft',
};

export default function CourseEditor({ courseId }: { courseId?: number }) {
  const router = useRouter();
  const [form, setForm] = useState<AcademyCourseInput>(emptyCourse);
  const [loading, setLoading] = useState(Boolean(courseId));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [choices, setChoices] = useState<{ categories: string[]; instructors: string[] }>({ categories: [], instructors: [] });

  useEffect(() => {
    let cancelled = false;
    listAcademyChoices().then((result) => { if (!cancelled) setChoices(result); }).catch(() => {
      // The fields remain usable as free text if suggestions are unavailable.
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    getAdminCourse(courseId)
      .then((course) => {
        if (cancelled) return;
        setForm({
          title: course.title,
          categoryName: course.categoryName ?? '',
          summary: course.summary ?? '',
          instructorName: course.instructorName ?? '',
          coverUrl: course.coverUrl ?? '',
          durationLabel: course.durationLabel ?? '',
          cpeCredits: Number(course.cpeCredits) || 0,
          price: Number(course.price) || 0,
          status: course.status,
        });
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof AcademyApiError ? reason.message : 'โหลดข้อมูลคอร์สไม่สำเร็จ');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [courseId]);

  const setField = <K extends keyof AcademyCourseInput>(key: K, value: AcademyCourseInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const selectCover = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      setField('coverUrl', await uploadAcademyCover(file));
    } catch (reason) {
      setUploadError(reason instanceof AcademyApiError ? reason.message : 'อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (uploading || saving) return;
    setSaving(true);
    setError('');
    try {
      await saveAdminCourse(form, courseId);
      router.push(COURSE_LIST);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof AcademyApiError ? reason.message : 'บันทึกคอร์สไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className={styles.container}><div className={styles.loading}>กำลังโหลดข้อมูลคอร์ส...</div></main>;

  return (
    <main className={styles.container}>
      <PageHeader title={courseId ? 'แก้ไขคอร์ส' : 'เพิ่มคอร์ส'} breadcrumb={['เว็บไซต์เภสัชกร', 'Pharmacy Academy', courseId ? 'แก้ไขคอร์ส' : 'เพิ่มคอร์ส']} />
      <Link className={styles.backLink} href={COURSE_LIST}><ArrowLeft size={17} /> กลับไปจัดการคอร์ส</Link>
      {error && <p className={styles.error} role="alert">{error}</p>}

      <form className={styles.editorForm} onSubmit={submit}>
        <div className={styles.editorLayout}>
          <div className={styles.editorMain}>
            <section className={styles.formSection} aria-labelledby="academy-basic-heading">
              <div className={styles.sectionHeading}>
                <h2 id="academy-basic-heading">ข้อมูลคอร์ส</h2>
                <p>ชื่อและคำอธิบายจะแสดงให้ผู้เรียนเห็นในหน้าคอร์ส</p>
              </div>
              <div className={styles.formGrid}>
                <label className={`${styles.field} ${styles.fullWidth}`}>
                  <span>ชื่อคอร์ส <span className={styles.required}>*</span></span>
                  <input required maxLength={255} value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="เช่น การใช้ยาอย่างสมเหตุผลในผู้ป่วยสูงอายุ" />
                </label>
                <label className={styles.field}>
                  <span>หมวดหมู่</span>
                  <input list="academy-categories" maxLength={150} value={form.categoryName} onChange={(event) => setField('categoryName', event.target.value)} placeholder="เลือกหรือพิมพ์หมวดหมู่" />
                  <datalist id="academy-categories">{choices.categories.map((name) => <option key={name} value={name} />)}</datalist>
                  <small>ใช้หมวดหมู่เดิม หรือพิมพ์ชื่อใหม่เพื่อสร้างอัตโนมัติ</small>
                </label>
                <label className={styles.field}>
                  <span>วิทยากร</span>
                  <input list="academy-instructors" maxLength={255} value={form.instructorName} onChange={(event) => setField('instructorName', event.target.value)} placeholder="เลือกหรือพิมพ์ชื่อวิทยากร" />
                  <datalist id="academy-instructors">{choices.instructors.map((name) => <option key={name} value={name} />)}</datalist>
                  <small>ใช้ชื่อเดิม หรือพิมพ์ชื่อใหม่เพื่อสร้างอัตโนมัติ</small>
                </label>
                <label className={`${styles.field} ${styles.fullWidth}`}>
                  <span>คำอธิบายย่อ</span>
                  <textarea rows={4} maxLength={4000} value={form.summary} onChange={(event) => setField('summary', event.target.value)} placeholder="สรุปเนื้อหาและประโยชน์ที่ผู้เรียนจะได้รับ" />
                </label>
              </div>
            </section>

            <section className={styles.formSection} aria-labelledby="academy-details-heading">
              <div className={styles.sectionHeading}>
                <h2 id="academy-details-heading">ระยะเวลาและค่าลงทะเบียน</h2>
                <p>ระบุข้อมูลสั้น ๆ เพื่อให้ผู้เรียนตัดสินใจได้ง่าย</p>
              </div>
              <div className={styles.metricsGrid}>
                <label className={styles.field}>
                  <span>ระยะเวลา</span>
                  <input maxLength={100} value={form.durationLabel} onChange={(event) => setField('durationLabel', event.target.value)} placeholder="เช่น 3 ชั่วโมง" />
                </label>
                <label className={styles.field}>
                  <span>หน่วยกิต CPE</span>
                  <input type="number" min="0" step="0.25" value={form.cpeCredits} onChange={(event) => setField('cpeCredits', Number(event.target.value))} />
                </label>
                <label className={styles.field}>
                  <span>ราคา (บาท)</span>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setField('price', Number(event.target.value))} />
                  <small>ใส่ 0 หากเป็นคอร์สฟรี</small>
                </label>
              </div>
            </section>
          </div>

          <aside className={styles.editorAside}>
            <section className={styles.formSection} aria-labelledby="academy-cover-heading">
              <div className={styles.sectionHeading}>
                <h2 id="academy-cover-heading">รูปหน้าปก</h2>
                <p>แสดงในรายการและหน้ารายละเอียดคอร์ส</p>
              </div>
              {form.coverUrl ? (
                <div className={styles.coverPreview}>
                  {/* Supabase returns the public URL after upload. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.coverUrl} alt="ตัวอย่างรูปหน้าปกคอร์ส" />
                </div>
              ) : (
                <div className={styles.coverPlaceholder}><ImagePlus size={30} aria-hidden="true" /><span>ยังไม่ได้เลือกรูปหน้าปก</span></div>
              )}
              <div className={styles.coverActions}>
                <label className={styles.uploadButton}>
                  <UploadCloud size={17} aria-hidden="true" />
                  {uploading ? 'กำลังอัปโหลด...' : form.coverUrl ? 'เปลี่ยนรูป' : 'เลือกรูปภาพ'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectCover} disabled={uploading || saving} />
                </label>
                {form.coverUrl && <button className={styles.removeCover} type="button" onClick={() => setField('coverUrl', '')} disabled={uploading || saving}><Trash2 size={16} /> ลบรูป</button>}
              </div>
              <p className={styles.coverHint}>JPG, PNG หรือ WebP ไม่เกิน 5 MB</p>
              {uploadError && <p className={styles.fieldError} role="alert">{uploadError}</p>}
            </section>

            <section className={styles.formSection} aria-labelledby="academy-publish-heading">
              <div className={styles.sectionHeading}>
                <h2 id="academy-publish-heading">การเผยแพร่</h2>
                <p>เลือกสถานะก่อนบันทึกคอร์ส</p>
              </div>
              <label className={styles.field}>
                <span>สถานะ</span>
                <select value={form.status} onChange={(event) => setField('status', event.target.value as AcademyCourseInput['status'])}>
                  <option value="draft">ฉบับร่าง</option>
                  <option value="published">เผยแพร่แล้ว</option>
                  <option value="archived">เก็บเข้าคลัง</option>
                </select>
              </label>
              <p className={styles.publishHint}>{form.status === 'published' ? 'คอร์สจะแสดงบนหน้า Pharmacy Academy' : form.status === 'draft' ? 'คอร์สยังไม่แสดงให้ผู้เรียนเห็น' : 'คอร์สจะไม่แสดงในรายการสาธารณะ'}</p>
            </section>
          </aside>
        </div>
        <div className={styles.formActions}>
          <Link className={styles.secondaryButton} href={COURSE_LIST}>ยกเลิก</Link>
          <button className={styles.primaryButton} type="submit" disabled={saving || uploading}><Save size={17} />{saving ? 'กำลังบันทึก...' : 'บันทึกคอร์ส'}</button>
        </div>
      </form>
    </main>
  );
}
