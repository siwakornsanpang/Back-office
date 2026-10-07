"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/app/utils/authFetch";
import styles from "../academy.module.css";
import AcademyPagination from "../AcademyPagination";
import AcademyEmptyState from "../AcademyEmptyState";

const API = process.env.NEXT_PUBLIC_API_URL;

type Row = {
  pharmacistLicense: string;
  displayName: string | null;
  courseTitle: string;
  cpeCredits: string | null;
  conferenceCode: string | null;
};

export default function AcademyCpePage() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Row[]>([]);
  const [listState, setListState] = useState<"loading" | "ready" | "error">("loading");

  const load = async () => {
    setListState("loading");
    try {
      const res = await authFetch(`${API}/academy/admin/cpe`);
      if (!res.ok) throw new Error();
      setItems(await res.json());
      setListState("ready");
    } catch { setListState("error"); }
  };
  useEffect(() => { load(); }, []);

  const currentPage = Math.min(page, Math.max(1, Math.ceil(items.length / 20)));
  const visible = items.slice((currentPage - 1) * 20, currentPage * 20);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>รายงาน CPE</h1>
          <p className={styles.subtitle}>ผู้เรียนที่เรียนจบคอร์สแล้ว พร้อม Conference Code</p>
        </div>
      </div>
      {listState === "error" && items.length > 0 && <div className={styles.listAlert} role="alert"><span>โหลดข้อมูลล่าสุดไม่สำเร็จ รายการด้านล่างเป็นข้อมูลก่อนหน้า</span><button className={styles.ghost} type="button" onClick={load}>ลองอีกครั้ง</button></div>}
      <div className={styles.tableScroll}><table className={styles.table}>
        <thead><tr><th>เลขใบอนุญาต</th><th>ชื่อ</th><th>คอร์ส</th><th className={styles.center}>หน่วยกิต</th><th>Conference Code</th></tr></thead>
        <tbody>
          {(listState === "loading" || items.length === 0) && <tr><td colSpan={5} className={styles.empty}><AcademyEmptyState state={listState} title={listState === "loading" ? "กำลังโหลดข้อมูล CPE" : listState === "error" ? "โหลดข้อมูล CPE ไม่สำเร็จ" : "ยังไม่มีข้อมูล CPE"} action={listState === "error" ? <button className={styles.ghost} type="button" onClick={load}>ลองอีกครั้ง</button> : undefined} hint={listState === "loading" ? "กรุณารอสักครู่" : listState === "error" ? "ลองโหลดข้อมูลอีกครั้ง" : "ข้อมูลจะแสดงเมื่อผู้เรียนเรียนจบคอร์สที่มีหน่วยกิต CPE"} /></td></tr>}
          {listState !== "loading" && visible.map((item) => (
            <tr key={`${item.pharmacistLicense}-${item.courseTitle}`}>
              <td>{item.pharmacistLicense}</td>
              <td>{item.displayName || "—"}</td>
              <td>{item.courseTitle}</td>
              <td className={styles.center}>{item.cpeCredits || "0"}</td>
              <td>{item.conferenceCode || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {listState === "ready" && <AcademyPagination page={currentPage} total={items.length} pageSize={20} onPageChange={setPage} itemLabel="รายการ" />}
    </div>
  );
}
