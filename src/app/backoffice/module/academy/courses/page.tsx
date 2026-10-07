"use client";
import { Edit, Trash2 } from "lucide-react";

import { useEffect, useState } from "react";
import Link from "next/link";
import { academySuccess, academyError, academyConfirmDelete } from "../academyFeedback";
import AcademyImagePreview from "../AcademyImagePreview";
import AcademyPagination from "../AcademyPagination";
import AcademyEmptyState from "../AcademyEmptyState";
import { authFetch } from "@/app/utils/authFetch";
import styles from "../academy.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;

type Course = {
  id: number;
  title: string;
  coverUrl: string | null;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  categoryName: string | null;
  instructorName: string | null;
  cpeCredits: string | null;
  price: string;
};

const STATUS_LABEL = { draft: "ร่าง", published: "เผยแพร่", archived: "เก็บถาวร" };

export default function AcademyCoursesPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Course[]>([]);
  const [status, setStatus] = useState<"all" | Course["status"]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API}/academy/admin/courses`);
      if (!res.ok) throw new Error("โหลดรายการคอร์สไม่สำเร็จ");
      setItems(await res.json());
    } catch {
      setError("โหลดรายการคอร์สไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (item: Course) => {
    const confirmed = await academyConfirmDelete(`ลบ ${item.title}?`);
    if (!confirmed.isConfirmed) return;
    try {
      const res = await authFetch(`${API}/academy/admin/courses/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await load();
      await academySuccess("ลบคอร์สสำเร็จ");
    } catch {
      academyError("ลบไม่สำเร็จ");
    }
  };

  const filtered = items.filter((item) => (status === "all" || item.status === status)
    && [item.title, item.categoryName, item.instructorName].some(value => value?.toLocaleLowerCase('th-TH').includes(query.trim().toLocaleLowerCase('th-TH'))));
  const filtering = status !== "all" || Boolean(query.trim());
  const resetFilters = () => { setQuery(""); setStatus("all"); setPage(1); };

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 20)));
  const visible = filtered.slice((currentPage - 1) * 20, currentPage * 20);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>คอร์สเรียน</h1>
          <p className={styles.subtitle}>เฉพาะสถานะเผยแพร่จะไปแสดงบนหน้า Academy</p>
        </div>
        <div className={styles.actions}>
          <Link href="/backoffice/module/academy/courses/new" className={styles.primary}>เพิ่มคอร์ส</Link>
        </div>
      </div>
      <div className={styles.toolbar}>
        <input aria-label="ค้นหาคอร์สเรียน" placeholder="ค้นหาชื่อคอร์ส หมวดหมู่ หรือวิทยากร" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} />
        <select aria-label="กรองสถานะคอร์ส" value={status} onChange={event => { setStatus(event.target.value as typeof status); setPage(1); }}>
          <option value="all">ทุกสถานะ</option>
          {(["draft", "published", "archived"] as const).map(key => <option key={key} value={key}>{STATUS_LABEL[key]}</option>)}
        </select>
      </div>
      {error && items.length > 0 && <p className={styles.listAlert} role="alert">{error} · รายการด้านล่างเป็นข้อมูลก่อนหน้า <button className={styles.ghost} type="button" onClick={load}>ลองอีกครั้ง</button></p>}
      <div className={styles.tableScroll}>
      <table className={`${styles.table} ${styles.coursesTable}`}>
        <thead><tr><th className={styles.imageColumn}>รูปปก</th><th>ชื่อคอร์ส</th><th>หมวดหมู่</th><th>วิทยากร</th><th className={styles.center}>CPE</th><th className={styles.numeric}>ราคา (บาท)</th><th>สถานะ</th><th className={styles.actionColumn}>จัดการ</th></tr></thead>
        <tbody>
          {(loading || visible.length === 0) && <tr><td colSpan={8} className={styles.empty}><AcademyEmptyState state={loading ? "loading" : error ? "error" : "ready"} title={loading ? "กำลังโหลดคอร์ส..." : error ? "ไม่สามารถแสดงรายการคอร์ส" : filtering ? "ไม่พบคอร์สที่ค้นหา" : "ยังไม่มีคอร์สเรียน"} action={error ? <button className={styles.ghost} type="button" onClick={load}>ลองอีกครั้ง</button> : filtering ? <button className={styles.ghost} type="button" onClick={resetFilters}>ล้างตัวกรอง</button> : <Link href="/backoffice/module/academy/courses/new" className={styles.primary}>เพิ่มคอร์ส</Link>} hint={loading ? "กรุณารอสักครู่" : error ? "ลองโหลดข้อมูลอีกครั้ง" : filtering ? "ลองเปลี่ยนคำค้นหาหรือสถานะคอร์ส" : "กดเพิ่มคอร์สเพื่อเริ่มสร้างเนื้อหา"} /></td></tr>}
          {!loading && visible.map((item) => (
            <tr key={item.id}>
              <td className={styles.imageColumn}><AcademyImagePreview src={item.coverUrl || ""} alt={`รูปปก ${item.title}`} cover /></td>
              <td className={styles.titleCell}>{item.title}{item.isFeatured ? " · แนะนำ" : ""}</td>
              <td>{item.categoryName || "—"}</td>
              <td>{item.instructorName || "—"}</td>
              <td className={styles.center}>{Number(item.cpeCredits || 0).toLocaleString("th-TH")}</td>
              <td className={styles.numeric}>{Number(item.price || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td><span className={`${styles.badge} ${item.status === "published" ? styles.badgeSuccess : item.status === "draft" ? styles.badgeWarning : styles.badgeNeutral}`}>{STATUS_LABEL[item.status]}</span></td>
              <td className={styles.actions}>
                <Link className={styles.iconEdit} aria-label="แก้ไข" title="แก้ไข" href={`/backoffice/module/academy/courses/${item.id}`}><Edit size={16} aria-hidden="true" /></Link>
                <button className={styles.iconDelete} aria-label="ลบ" title="ลบ" type="button" onClick={() => remove(item)}><Trash2 size={16} aria-hidden="true" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {!loading && !error && <AcademyPagination page={currentPage} total={filtered.length} pageSize={20} onPageChange={setPage} itemLabel="คอร์ส" />}
    </div>
  );
}
