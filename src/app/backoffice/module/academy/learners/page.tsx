"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/app/utils/authFetch";
import styles from "../academy.module.css";
import AcademyEmptyState from "../AcademyEmptyState";
import AcademyPagination from "../AcademyPagination";

const API = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 20;

type Enrollment = {
  id: number;
  courseTitle: string;
  pharmacistLicense: string;
  displayName: string | null;
  status: string;
  progressPercent: number;
  examPassed: boolean;
  enrolledAt: string | null;
};

const STATUS_LABEL: Record<string, string> = { active: "กำลังเรียน", cancelled: "ยกเลิก" };

export default function AcademyLearnersPage() {
  const [items, setItems] = useState<Enrollment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [status, setStatus] = useState("");
  const [listState, setListState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = q.trim();
      if (query !== next) {
        setPage(1);
        setQuery(next);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [q, query]);

  useEffect(() => {
    let current = true;
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (query) params.set("q", query);
    if (status) params.set("status", status);
    queueMicrotask(() => { if (current) setListState("loading"); });
    authFetch(`${API}/academy/admin/enrollments?${params}`).then(async (res) => {
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!current) return;
      setItems(data.items || []);
      setTotal(Number(data.total) || 0);
      setListState("ready");
    }).catch(() => { if (current) setListState("error"); });
    return () => { current = false; };
  }, [query, status, page, reloadKey]);

  const filtering = Boolean(query || status);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>ผู้เรียน</h1>
          <p className={styles.subtitle}>ค้นหาจากชื่อ เลขใบอนุญาต หรือชื่อคอร์ส แสดงทีละ {PAGE_SIZE} รายการ</p>
        </div>
      </div>
      <div className={styles.toolbar}>
        <input aria-label="ค้นหาชื่อ เลขใบอนุญาต หรือคอร์ส" value={q} onChange={(event) => setQ(event.target.value)} placeholder="ค้นหาชื่อ เลขใบอนุญาต หรือคอร์ส" />
        <select aria-label="กรองสถานะ" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="">ทุกสถานะ</option>
          <option value="active">กำลังเรียน</option>
          <option value="cancelled">ยกเลิก</option>
        </select>
      </div>
      {listState === "error" && items.length > 0 && <div className={styles.listAlert} role="alert"><span>โหลดข้อมูลล่าสุดไม่สำเร็จ รายการด้านล่างเป็นข้อมูลก่อนหน้า</span><button className={styles.ghost} type="button" onClick={() => setReloadKey(value => value + 1)}>ลองอีกครั้ง</button></div>}
      <div className={styles.tableScroll}><table className={styles.table}>
        <thead>
          <tr><th>คอร์ส</th><th>ชื่อ</th><th>เลขใบอนุญาต</th><th className={styles.numeric}>ความคืบหน้า</th><th>สถานะ</th></tr>
        </thead>
        <tbody>
          {(listState === "loading" || items.length === 0) && <tr><td colSpan={5} className={styles.empty}><AcademyEmptyState state={listState} title={listState === "loading" ? "กำลังโหลดผู้เรียน" : listState === "error" ? "โหลดข้อมูลผู้เรียนไม่สำเร็จ" : filtering ? "ไม่พบผู้เรียนที่ค้นหา" : "ยังไม่มีผู้ลงทะเบียน"} action={listState === "error" ? <button className={styles.ghost} type="button" onClick={() => setReloadKey(value => value + 1)}>ลองอีกครั้ง</button> : filtering ? <button className={styles.ghost} type="button" onClick={() => { setQ(""); setQuery(""); setStatus(""); setPage(1); }}>ล้างตัวกรอง</button> : undefined} hint={listState === "loading" ? "กรุณารอสักครู่" : listState === "error" ? "ลองโหลดข้อมูลอีกครั้ง" : filtering ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ" : "เมื่อมีผู้ลงทะเบียนคอร์ส รายการจะปรากฏที่นี่"} /></td></tr>}
          {listState !== "loading" && items.map((item) => (
            <tr key={item.id}>
              <td>{item.courseTitle}</td>
              <td>{item.displayName || "—"}</td>
              <td>{item.pharmacistLicense}</td>
              <td className={styles.numeric}>{item.progressPercent}%{item.examPassed ? " · สอบผ่าน" : ""}</td>
              <td><span className={`${styles.badge} ${item.status === "active" || item.status === "paid" ? styles.badgeSuccess : item.status === "pending" ? styles.badgeWarning : item.status === "cancelled" || item.status === "rejected" ? styles.badgeDanger : styles.badgeNeutral}`}>{STATUS_LABEL[item.status] || item.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {listState === "ready" && <AcademyPagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel="รายการ" />}
    </div>
  );
}
