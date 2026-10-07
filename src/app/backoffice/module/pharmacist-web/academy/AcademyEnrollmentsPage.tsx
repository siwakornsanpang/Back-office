'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ClipboardList, Plus, RotateCcw, Search, Users } from 'lucide-react';
import PageHeader from '@/app/components/ui/PageHeader';
import styles from './academy.module.css';
import { AcademyApiError, AcademyCourse, AcademyCourseEnrollment, listAllAdminCourses, listCourseEnrollments } from './academyApi';

const PAGE_SIZE = 20;

function EnrollmentsContent() {
  const searchParams = useSearchParams();
  const requestedCourseId = searchParams.get('courseId') ?? '';
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [courseId, setCourseId] = useState(requestedCourseId);
  const [items, setItems] = useState<AcademyCourseEnrollment[]>([]);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    listAllAdminCourses()
      .then((items) => {
        if (cancelled) return;
        setCourses(items);
        const requestedExists = requestedCourseId && items.some((course) => String(course.id) === requestedCourseId);
        if (requestedExists) {
          setLoading(true);
          setCourseId(requestedCourseId);
        } else if (items[0]) {
          setLoading(true);
          setCourseId(String(items[0].id));
        } else {
          setCourseId('');
          setItems([]);
          setTotal(0);
          setLoading(false);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof AcademyApiError ? reason.message : 'โหลดรายการคอร์สไม่สำเร็จ');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [requestedCourseId]);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    listCourseEnrollments(Number(courseId), { search, page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setError('');
        setItems(result.items);
        setTotal(result.total);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof AcademyApiError ? reason.message : 'โหลดผู้ลงทะเบียนไม่สำเร็จ');
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [courseId, search, page, revision]);

  const applySearch = (event: FormEvent) => {
    event.preventDefault();
    const nextSearch = searchDraft.trim();
    setLoading(true);
    setError('');
    setSearch(nextSearch);
    setPage(1);
    setRevision((value) => value + 1);
  };
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const courseTitle = courses.find((course) => String(course.id) === courseId)?.title ?? '';
  const clearSearch = () => {
    setSearchDraft('');
    setSearch('');
    setPage(1);
    setError('');
  };

  return (
    <main className={styles.container}>
      <PageHeader title="ผู้ลงทะเบียน Pharmacy Academy" breadcrumb={['เว็บไซต์เภสัชกร', 'Pharmacy Academy', 'ผู้ลงทะเบียน']} />
      <div className={styles.description}><ClipboardList size={20} /><span>ตรวจสอบรายชื่อสมาชิกที่ลงทะเบียนแต่ละคอร์ส</span></div>

      <div className={styles.enrollmentToolbar}>
        <label className={styles.field}><span>เลือกคอร์ส</span><select value={courseId} disabled={courses.length === 0} onChange={(event) => { setLoading(true); setError(''); setCourseId(event.target.value); setPage(1); }}>
          {courses.length === 0 && <option value="">ยังไม่มีคอร์ส</option>}
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select></label>
        <form className={styles.searchForm} onSubmit={applySearch}>
          <label className={styles.searchBox}><Search size={18} aria-hidden="true" /><input value={searchDraft} disabled={!courseId} onChange={(event) => setSearchDraft(event.target.value)} placeholder="ค้นหาชื่อหรือเลขใบอนุญาต" aria-label="ค้นหาผู้ลงทะเบียน" /></label>
          <button className={styles.secondaryButton} type="submit" disabled={!courseId}>ค้นหา</button>
        </form>
      </div>

      <div className={styles.tableSummary}>
        <span>{courseTitle ? <>ผู้ลงทะเบียนใน “{courseTitle}” <strong>{total.toLocaleString('th-TH')}</strong> คน</> : 'ผู้ลงทะเบียน'}</span>
        {search && <button className={styles.clearButton} type="button" onClick={clearSearch}><RotateCcw size={15} /> ล้างคำค้นหา</button>}
      </div>
      <section className={styles.tableSection} aria-live="polite">
        {loading ? <div className={styles.loading}>กำลังโหลดรายชื่อ...</div> : error ? (
          <div className={styles.emptyState} role="alert"><span className={styles.emptyIcon}><Users size={27} /></span><strong>แสดงรายชื่อไม่ได้</strong><span>{error}</span></div>
        ) : items.length ? (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead><tr><th scope="col">ผู้เรียน</th><th scope="col">เลขที่ใบอนุญาต</th><th scope="col">วันที่ลงทะเบียน</th><th scope="col">สถานะ</th></tr></thead>
              <tbody>{items.map((item) => <tr key={item.id}>
                <td><div className={styles.learnerCell}><span className={styles.learnerAvatar} aria-hidden="true">{item.displayName?.trim().charAt(0) || 'ผ'}</span><strong>{item.displayName || 'ไม่ระบุชื่อ'}</strong></div></td>
                <td className={styles.licenseCell}>{item.pharmacistLicense || '—'}</td>
                <td>{item.enrolledAt ? new Date(item.enrolledAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</td>
                <td>{item.status === 'active' ? <span className={`${styles.status} ${styles.status_published}`}>ลงทะเบียนแล้ว</span> : <span className={`${styles.status} ${styles.status_draft}`}>ยกเลิก</span>}</td>
              </tr>)}</tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>{search ? <Search size={27} /> : <Users size={27} />}</span>
            <strong>{courses.length === 0 ? 'ยังไม่มีคอร์สให้ตรวจสอบ' : search ? 'ไม่พบผู้ลงทะเบียนที่ตรงกับคำค้นหา' : 'คอร์สนี้ยังไม่มีผู้ลงทะเบียน'}</strong>
            <span>{courses.length === 0 ? 'เพิ่มคอร์สก่อน แล้วรายชื่อผู้ลงทะเบียนจะแสดงที่นี่' : search ? 'ลองค้นด้วยชื่อหรือเลขใบอนุญาตอื่น' : 'เมื่อสมาชิกลงทะเบียน รายชื่อจะปรากฏในตารางนี้'}</span>
            {courses.length === 0 ? <Link className={styles.primaryButton} href="/backoffice/module/pharmacist-web/academy/courses/new"><Plus size={17} /> เพิ่มคอร์ส</Link> : search ? <button className={styles.secondaryButton} type="button" onClick={clearSearch}>ล้างคำค้นหา</button> : null}
          </div>
        )}
      </section>

      {pageCount > 1 && <nav className={styles.pagination} aria-label="แบ่งหน้ารายชื่อ">
        <button type="button" disabled={page === 1} onClick={() => { setLoading(true); setPage((value) => value - 1); }}>ก่อนหน้า</button>
        <span>หน้า {page} จาก {pageCount}</span>
        <button type="button" disabled={page === pageCount} onClick={() => { setLoading(true); setPage((value) => value + 1); }}>ถัดไป</button>
      </nav>}
    </main>
  );
}

export default function AcademyEnrollmentsPage() {
  return <Suspense fallback={<main className={styles.container}><div className={styles.loading}>กำลังโหลด...</div></main>}><EnrollmentsContent /></Suspense>;
}
