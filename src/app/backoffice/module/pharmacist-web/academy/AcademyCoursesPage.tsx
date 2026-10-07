'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookOpen, ClipboardList, Pencil, Plus, RotateCcw, Search } from 'lucide-react';
import PageHeader from '@/app/components/ui/PageHeader';
import styles from './academy.module.css';
import { AcademyApiError, AcademyCourse, listAdminCourses } from './academyApi';

const PAGE_SIZE = 20;
const statusLabels = { draft: 'ฉบับร่าง', published: 'เผยแพร่แล้ว', archived: 'เก็บเข้าคลัง' };

export default function AcademyCoursesPage() {
  const [items, setItems] = useState<AcademyCourse[]>([]);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    listAdminCourses({ search, status, page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setError('');
        setItems(result.items);
        setTotal(result.total);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(reason instanceof AcademyApiError ? reason.message : 'โหลดคอร์สไม่สำเร็จ');
        setItems([]);
        setTotal(0);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [search, status, page, revision]);

  const applySearch = (event: React.FormEvent) => {
    event.preventDefault();
    const nextSearch = searchDraft.trim();
    setLoading(true);
    setError('');
    setSearch(nextSearch);
    setPage(1);
    setRevision((value) => value + 1);
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(search || status);
  const clearFilters = () => {
    setSearchDraft('');
    setSearch('');
    setStatus('');
    setPage(1);
    setError('');
    setLoading(true);
  };

  return (
    <main className={styles.container}>
      <PageHeader title="Pharmacy Academy" breadcrumb={['เว็บไซต์เภสัชกร', 'Pharmacy Academy', 'จัดการคอร์ส']} />
      <div className={styles.headingRow}>
        <div className={styles.description}><BookOpen size={20} /><span>จัดการคอร์สที่แสดงบนหน้า Pharmacy Academy</span></div>
        <Link className={styles.primaryButton} href="/backoffice/module/pharmacist-web/academy/courses/new"><Plus size={18} /> เพิ่มคอร์ส</Link>
      </div>

      <form className={styles.filters} onSubmit={applySearch}>
        <label className={styles.searchBox}>
          <Search size={18} aria-hidden="true" />
          <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="ค้นหาชื่อคอร์สหรือวิทยากร" aria-label="ค้นหาคอร์ส" />
        </label>
        <select value={status} onChange={(event) => { setLoading(true); setError(''); setStatus(event.target.value); setPage(1); }} aria-label="กรองตามสถานะ">
          <option value="">ทุกสถานะ</option>
          <option value="draft">ฉบับร่าง</option>
          <option value="published">เผยแพร่แล้ว</option>
          <option value="archived">เก็บเข้าคลัง</option>
        </select>
        <button type="submit" className={styles.secondaryButton}>ค้นหา</button>
      </form>

      <div className={styles.tableSummary}>
        <span>รายการคอร์ส <strong>{total.toLocaleString('th-TH')}</strong> รายการ</span>
        {hasFilters && <button className={styles.clearButton} type="button" onClick={clearFilters}><RotateCcw size={15} /> ล้างตัวกรอง</button>}
      </div>
      <section className={styles.tableSection} aria-live="polite">
        {loading ? <div className={styles.loading}>กำลังโหลดข้อมูลคอร์ส...</div> : error ? (
          <div className={styles.emptyState} role="alert"><span className={styles.emptyIcon}><BookOpen size={26} /></span><strong>แสดงข้อมูลคอร์สไม่ได้</strong><span>{error}</span></div>
        ) : items.length ? (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead><tr><th scope="col">คอร์ส</th><th scope="col">หมวดหมู่</th><th scope="col">ระยะเวลา / CPE</th><th scope="col">ราคา</th><th scope="col">สถานะ</th><th scope="col">จัดการ</th></tr></thead>
              <tbody>
                {items.map((course) => (
                  <tr key={course.id}>
                    <td><div className={styles.courseCell}>
                      {course.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className={styles.courseThumbnail} src={course.coverUrl} alt="" />
                      ) : <span className={styles.courseThumbnailEmpty}><BookOpen size={20} aria-hidden="true" /></span>}
                      <div className={styles.courseCellText}><strong>{course.title}</strong><small>{course.instructorName || 'ยังไม่ระบุวิทยากร'}</small></div>
                    </div></td>
                    <td>{course.categoryName || '—'}</td>
                    <td><div className={styles.courseMeta}><span>{course.durationLabel || 'ไม่ระบุเวลา'}</span><small>{Number(course.cpeCredits).toLocaleString('th-TH')} หน่วยกิต CPE</small></div></td>
                    <td className={styles.priceCell}>{Number(course.price) ? `${Number(course.price).toLocaleString('th-TH')} บาท` : 'ฟรี'}</td>
                    <td><span className={`${styles.status} ${course.status === 'draft' ? styles.status_draft : course.status === 'published' ? styles.status_published : styles.status_archived}`}>{statusLabels[course.status]}</span></td>
                    <td><div className={styles.rowActions}>
                      <Link className={styles.textButton} href={`/backoffice/module/pharmacist-web/academy/courses/${course.id}/edit`}><Pencil size={15} /> แก้ไข</Link>
                      <Link className={styles.textButton} href={`/backoffice/module/pharmacist-web/academy/enrollments?courseId=${course.id}`}><ClipboardList size={15} /> ผู้ลงทะเบียน</Link>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>{hasFilters ? <Search size={27} /> : <BookOpen size={27} />}</span>
            <strong>{hasFilters ? 'ไม่พบคอร์สที่ตรงกับตัวกรอง' : 'ยังไม่มีคอร์สใน Pharmacy Academy'}</strong>
            <span>{hasFilters ? 'ลองเปลี่ยนคำค้นหาหรือสถานะ แล้วค้นหาอีกครั้ง' : 'เริ่มเพิ่มคอร์สแรกเพื่อให้ผู้เรียนค้นพบคอร์สของคุณ'}</span>
            {hasFilters ? <button className={styles.secondaryButton} type="button" onClick={clearFilters}>ล้างตัวกรอง</button> : <Link className={styles.primaryButton} href="/backoffice/module/pharmacist-web/academy/courses/new"><Plus size={17} /> เพิ่มคอร์สแรก</Link>}
          </div>
        )}
      </section>

      {pageCount > 1 && <nav className={styles.pagination} aria-label="แบ่งหน้าคอร์ส">
        <button type="button" disabled={page === 1} onClick={() => { setLoading(true); setPage((value) => value - 1); }}>ก่อนหน้า</button>
        <span>หน้า {page} จาก {pageCount}</span>
        <button type="button" disabled={page === pageCount} onClick={() => { setLoading(true); setPage((value) => value + 1); }}>ถัดไป</button>
      </nav>}
    </main>
  );
}
