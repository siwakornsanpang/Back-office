"use client";
import { Check, X } from "lucide-react";

import { useEffect, useState } from "react";
import { authFetch } from "@/app/utils/authFetch";
import styles from "../academy.module.css";
import AcademyImagePreview from "../AcademyImagePreview";
import { academySuccess, academyError } from "../academyFeedback";
import AcademyEmptyState from "../AcademyEmptyState";
import AcademyPagination from "../AcademyPagination";

const API = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 20;

type Order = {
  id: number;
  courseTitle: string;
  displayName: string | null;
  pharmacistLicense: string;
  amount: string;
  status: string;
  slipUrl: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "รอตรวจ",
  paid: "ชำระแล้ว",
  rejected: "ปฏิเสธ",
  refunded: "คืนเงินแล้ว",
};

export default function AcademyOrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
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
    authFetch(`${API}/academy/admin/orders?${params}`).then(async (res) => {
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!current) return;
      setItems(data.items || []);
      setTotal(Number(data.total) || 0);
      setListState("ready");
    }).catch(() => { if (current) setListState("error"); });
    return () => { current = false; };
  }, [query, status, page, reloadKey]);

  const act = async (id: number, action: "approve" | "reject") => {
    try {
      const res = await authFetch(`${API}/academy/admin/orders/${id}/${action}`, { method: "POST", body: "{}" });
      if (!res.ok) { const data = await res.json().catch(() => ({})); await academyError("บันทึกไม่สำเร็จ", data.message); return; }
      setReloadKey((value) => value + 1);
      await academySuccess(action === "approve" ? "ยืนยันการชำระเงินสำเร็จ" : "ปฏิเสธการชำระเงินสำเร็จ");
    } catch { await academyError("บันทึกไม่สำเร็จ"); }
  };

  const filtering = Boolean(query || status);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>การชำระเงิน</h1>
          <p className={styles.subtitle}>ค้นหาจากชื่อ เลขใบอนุญาต หรือชื่อคอร์ส แสดงทีละ {PAGE_SIZE} รายการ</p>
        </div>
      </div>
      <div className={styles.toolbar}>
        <input aria-label="ค้นหาชื่อ เลขใบอนุญาต หรือคอร์ส" value={q} onChange={(event) => setQ(event.target.value)} placeholder="ค้นหาชื่อ เลขใบอนุญาต หรือคอร์ส" />
        <select aria-label="กรองสถานะ" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="">ทุกสถานะ</option>
          <option value="pending">รอตรวจ</option>
          <option value="paid">ชำระแล้ว</option>
          <option value="rejected">ปฏิเสธ</option>
          <option value="refunded">คืนเงินแล้ว</option>
        </select>
      </div>
      {listState === "error" && items.length > 0 && <div className={styles.listAlert} role="alert"><span>โหลดข้อมูลล่าสุดไม่สำเร็จ รายการด้านล่างเป็นข้อมูลก่อนหน้า</span><button className={styles.ghost} type="button" onClick={() => setReloadKey(value => value + 1)}>ลองอีกครั้ง</button></div>}
      <div className={styles.tableScroll}><table className={styles.table}>
        <thead><tr><th>คอร์ส</th><th>ผู้เรียน</th><th className={styles.numeric}>จำนวนเงิน</th><th>สลิป</th><th>สถานะ</th><th className={styles.actionColumn}>จัดการ</th></tr></thead>
        <tbody>
          {(listState === "loading" || items.length === 0) && <tr><td colSpan={6} className={styles.empty}><AcademyEmptyState state={listState} title={listState === "loading" ? "กำลังโหลดการชำระเงิน" : listState === "error" ? "โหลดรายการชำระเงินไม่สำเร็จ" : filtering ? "ไม่พบรายการชำระเงิน" : "ยังไม่มีการชำระเงิน"} action={listState === "error" ? <button className={styles.ghost} type="button" onClick={() => setReloadKey(value => value + 1)}>ลองอีกครั้ง</button> : filtering ? <button className={styles.ghost} type="button" onClick={() => { setQ(""); setQuery(""); setStatus(""); setPage(1); }}>ล้างตัวกรอง</button> : undefined} hint={listState === "loading" ? "กรุณารอสักครู่" : listState === "error" ? "ลองโหลดข้อมูลอีกครั้ง" : filtering ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ" : "เมื่อผู้เรียนส่งรายการชำระเงิน ข้อมูลจะปรากฏที่นี่"} /></td></tr>}
          {listState !== "loading" && items.map((item) => (
            <tr key={item.id}>
              <td>{item.courseTitle}</td>
              <td>{item.displayName || item.pharmacistLicense}</td>
              <td className={styles.numeric}>{Number(item.amount).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>{item.slipUrl ? <AcademyImagePreview src={item.slipUrl} alt={`สลิปคอร์ส ${item.courseTitle}`} label="ดูสลิป" /> : "—"}</td>
              <td><span className={`${styles.badge} ${item.status === "active" || item.status === "paid" ? styles.badgeSuccess : item.status === "pending" ? styles.badgeWarning : item.status === "cancelled" || item.status === "rejected" ? styles.badgeDanger : styles.badgeNeutral}`}>{STATUS_LABEL[item.status] || item.status}</span></td>
              <td className={styles.actions}>
                {item.status === "pending" && (
                  <>
                    <button className={styles.iconEdit} type="button" aria-label="ยืนยัน" title="ยืนยัน" onClick={() => act(item.id, "approve")}><Check size={16} aria-hidden="true" /></button>
                    <button className={styles.iconDelete} type="button" aria-label="ปฏิเสธ" title="ปฏิเสธ" onClick={() => act(item.id, "reject")}><X size={16} aria-hidden="true" /></button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {listState === "ready" && <AcademyPagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel="รายการ" />}
    </div>
  );
}
