"use client";
import { Check, X } from "lucide-react";

import { useEffect, useState } from "react";
import { authFetch } from "@/app/utils/authFetch";
import styles from "../academy.module.css";
import { academySuccess, academyError } from "../academyFeedback";
import AcademyPagination from "../AcademyPagination";
import AcademyEmptyState from "../AcademyEmptyState";

const API = process.env.NEXT_PUBLIC_API_URL;

type Refund = {
  id: number;
  courseTitle: string;
  displayName: string | null;
  pharmacistLicense: string;
  amount: string;
  reason: string;
  status: string;
};

const STATUS_LABEL: Record<string, string> = { pending: "รอตรวจ", approved: "คืนเงินแล้ว", rejected: "ปฏิเสธ" };

export default function AcademyRefundsPage() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Refund[]>([]);
  const [listState, setListState] = useState<"loading" | "ready" | "error">("loading");

  const load = async () => {
    setListState("loading");
    try {
      const res = await authFetch(`${API}/academy/admin/refunds`);
      if (!res.ok) throw new Error();
      setItems(await res.json());
      setListState("ready");
    } catch { setListState("error"); }
  };

  useEffect(() => { load(); }, []);

  const act = async (id: number, action: "approve" | "reject") => {
    try {
      const res = await authFetch(`${API}/academy/admin/refunds/${id}/${action}`, { method: "POST", body: "{}" });
      if (!res.ok) { const data = await res.json().catch(() => ({})); await academyError("บันทึกไม่สำเร็จ", data.message); return; }
      await load();
      await academySuccess(action === "approve" ? "อนุมัติคำขอสำเร็จ" : "ปฏิเสธคำขอสำเร็จ");
    } catch { await academyError("บันทึกไม่สำเร็จ"); }
  };

  const currentPage = Math.min(page, Math.max(1, Math.ceil(items.length / 20)));
  const visible = items.slice((currentPage - 1) * 20, currentPage * 20);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>คำขอคืนเงิน</h1>
          <p className={styles.subtitle}>อนุมัติได้เมื่อผู้เรียนยังเรียนไม่จบ</p>
        </div>
      </div>
      {listState === "error" && items.length > 0 && <div className={styles.listAlert} role="alert"><span>โหลดข้อมูลล่าสุดไม่สำเร็จ รายการด้านล่างเป็นข้อมูลก่อนหน้า</span><button className={styles.ghost} type="button" onClick={load}>ลองอีกครั้ง</button></div>}
      <div className={styles.tableScroll}><table className={styles.table}>
        <thead><tr><th>คอร์ส</th><th>ผู้เรียน</th><th className={styles.numeric}>จำนวนเงิน</th><th>เหตุผล</th><th>สถานะ</th><th className={styles.actionColumn}>จัดการ</th></tr></thead>
        <tbody>
          {(listState === "loading" || items.length === 0) && <tr><td colSpan={6} className={styles.empty}><AcademyEmptyState state={listState} title={listState === "loading" ? "กำลังโหลดคำขอ" : listState === "error" ? "โหลดคำขอคืนเงินไม่สำเร็จ" : "ยังไม่มีคำขอคืนเงิน"} action={listState === "error" ? <button className={styles.ghost} type="button" onClick={load}>ลองอีกครั้ง</button> : undefined} hint={listState === "loading" ? "กรุณารอสักครู่" : listState === "error" ? "ลองโหลดข้อมูลอีกครั้ง" : "เมื่อผู้เรียนส่งคำขอ รายการจะปรากฏที่นี่"} /></td></tr>}
          {listState !== "loading" && visible.map((item) => (
            <tr key={item.id}>
              <td>{item.courseTitle}</td>
              <td>{item.displayName || item.pharmacistLicense}</td>
              <td className={styles.numeric}>{Number(item.amount).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>{item.reason}</td>
              <td><span className={`${styles.badge} ${item.status === "approved" ? styles.badgeSuccess : item.status === "pending" ? styles.badgeWarning : item.status === "rejected" ? styles.badgeDanger : styles.badgeNeutral}`}>{STATUS_LABEL[item.status] || item.status}</span></td>
              <td className={styles.actions}>
                {item.status === "pending" && (
                  <>
                    <button className={styles.iconEdit} type="button" aria-label="อนุมัติ" title="อนุมัติ" onClick={() => act(item.id, "approve")}><Check size={16} aria-hidden="true" /></button>
                    <button className={styles.iconDelete} type="button" aria-label="ปฏิเสธ" title="ปฏิเสธ" onClick={() => act(item.id, "reject")}><X size={16} aria-hidden="true" /></button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {listState === "ready" && <AcademyPagination page={currentPage} total={items.length} pageSize={20} onPageChange={setPage} itemLabel="รายการ" />}
    </div>
  );
}
