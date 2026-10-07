"use client";
import { Trash2 } from "lucide-react";

import { FormEvent, useEffect, useRef, useState } from "react";
import { authFetch } from "@/app/utils/authFetch";
import styles from "../academy.module.css";
import formStyles from "../academyForms.module.css";
import { academySuccess, academyError, academyConfirmDelete } from "../academyFeedback";
import AcademyEmptyState from "../AcademyEmptyState";
import AcademyPagination from "../AcademyPagination";
import AcademyModal from "../AcademyModal";

import AcademyForm, { AcademyField } from "../AcademyForm";
import useAcademyUnsavedChanges from "../useAcademyUnsavedChanges";

const API = process.env.NEXT_PUBLIC_API_URL;

type Course = { id: number; title: string };
type Review = {
  id: number;
  courseId: number;
  courseTitle: string;
  rating: number;
  body: string;
  reviewerName: string;
  reviewerRole: string | null;
};

const empty = { courseId: "", rating: "5", body: "", reviewerName: "", reviewerRole: "" };

export default function AcademyReviewsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [items, setItems] = useState<Review[]>([]);
  const [form, setForm] = useState(empty);
  const [formOpen, setFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const confirmDiscard = useAcademyUnsavedChanges(formOpen && JSON.stringify(form) !== JSON.stringify(empty), saving);
  const closeForm = async () => { if (await confirmDiscard()) { setForm(empty); setFormOpen(false); } };
  const [listState, setListState] = useState<"loading" | "ready" | "error">("loading");

  const load = async () => {
    setListState("loading");
    try {
      const [courseRes, reviewRes] = await Promise.all([
        authFetch(`${API}/academy/admin/courses`),
        authFetch(`${API}/academy/admin/reviews`),
      ]);
      if (courseRes.ok) setCourses(await courseRes.json());
      if (!reviewRes.ok) throw new Error();
      setItems(await reviewRes.json());
      setListState("ready");
    } catch { setListState("error"); }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
    const res = await authFetch(`${API}/academy/admin/reviews`, {
      method: "POST",
      body: JSON.stringify({ ...form, courseId: Number(form.courseId), rating: Number(form.rating) }),
    });
    if (!res.ok) {
      const data = await res.json();
      await academyError("บันทึกไม่สำเร็จ", data.message || "กรุณาลองอีกครั้ง");
      return;
    }
    setForm(empty);
    setFormOpen(false);
    await load();
    await academySuccess("บันทึกรีวิวสำเร็จ");
    } catch { await academyError("บันทึกไม่สำเร็จ", "กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง"); }
    finally { savingRef.current = false; setSaving(false); }
  };

  const remove = async (item: Review) => {
    const confirmed = await academyConfirmDelete("ลบรีวิวนี้?");
    if (!confirmed.isConfirmed) return;
    try {
    const res = await authFetch(`${API}/academy/admin/reviews/${item.id}`, { method: "DELETE" });
    if (!res.ok) { await academyError("ลบไม่สำเร็จ"); return; }
    await load();
    await academySuccess("ลบรีวิวสำเร็จ");
    } catch { await academyError("ลบไม่สำเร็จ"); }
  };

  const pageCount = Math.max(1, Math.ceil(items.length / 20));
  const currentPage = Math.min(page, pageCount);
  const visibleItems = items.slice((currentPage - 1) * 20, currentPage * 20);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>รีวิว</h1>
          <p className={styles.subtitle}>รีวิวของคอร์สที่เผยแพร่แล้วจะไปอยู่บนหน้า Academy</p>
        </div>
        <button className={styles.primary} type="button" disabled={saving} onClick={() => { setForm(empty); setFormOpen(true); }}>เพิ่มรีวิว</button>
      </div>
      <AcademyModal open={formOpen} title="เพิ่มรีวิว" titleId="academy-reviews-modal-title" saving={saving} onClose={closeForm}>
      <AcademyForm className={`${styles.form} ${styles.modalForm} ${formStyles.form}`} onSubmit={onSubmit} aria-busy={saving}>
        <fieldset disabled={saving}><p className={styles.formHint}>ช่องที่มี * จำเป็นต้องกรอก</p>
        <div className={`${styles.row2} ${formStyles.fields}`}>
          <AcademyField label="คอร์ส"><select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
              <option value="">เลือกคอร์ส</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </AcademyField>
          <AcademyField label="คะแนน"><select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </AcademyField>
        </div>
        <div className={`${styles.row2} ${formStyles.fields}`}>
          <AcademyField label="ชื่อผู้รีวิว"><input value={form.reviewerName} onChange={(e) => setForm({ ...form, reviewerName: e.target.value })} required /></AcademyField>
          <AcademyField label="บทบาท"><input value={form.reviewerRole} onChange={(e) => setForm({ ...form, reviewerRole: e.target.value })} placeholder="เภสัชกรโรงพยาบาล" /></AcademyField>
        </div>
        <AcademyField label="ข้อความ"><textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required /></AcademyField>
        <div className={styles.actions}>
          <button className={styles.primary} type="submit" disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึก"}</button>
          <button className={styles.ghost} type="button" onClick={closeForm}>ยกเลิก</button>
        </div>
      </fieldset>
      </AcademyForm>
      </AcademyModal>
      <div className={styles.tableScroll} style={{ marginTop: "1.25rem" }}><table className={styles.table}>
        <thead><tr><th>คอร์ส</th><th>ผู้รีวิว</th><th className={styles.numeric}>คะแนน</th><th>ข้อความ</th><th className={styles.actionColumn}>จัดการ</th></tr></thead>
        <tbody>
          {(items.length === 0 || listState !== "ready") && <tr><td colSpan={5} className={styles.empty}><AcademyEmptyState action={listState === "error" ? <button className={styles.ghost} type="button" onClick={load}>ลองอีกครั้ง</button> : undefined} state={listState} title={listState === "loading" ? "กำลังโหลดรีวิว" : listState === "error" ? "โหลดรีวิวไม่สำเร็จ" : "ยังไม่มีรีวิว"} hint={listState === "loading" ? "กรุณารอสักครู่" : listState === "error" ? "กรุณาลองเปิดหน้านี้อีกครั้ง" : "กดเพิ่มรีวิวเพื่อแสดงความเห็นของผู้เรียนบนหน้า Academy"} /></td></tr>}
          {listState === "ready" && visibleItems.map((item) => (
            <tr key={item.id}>
              <td>{item.courseTitle}</td>
              <td>{item.reviewerName}<div style={{ color: "#64748b" }}>{item.reviewerRole}</div></td>
              <td className={styles.numeric}>{item.rating}</td>
              <td>{item.body}</td>
              <td className={styles.actionColumn}><button className={styles.iconDelete} aria-label="ลบ" title="ลบ" type="button" disabled={saving} onClick={() => remove(item)}><Trash2 size={16} aria-hidden="true" /></button></td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {listState === "ready" && <AcademyPagination page={currentPage} pageSize={20} total={items.length} onPageChange={setPage} itemLabel="รีวิว" />}
    </div>
  );
}
