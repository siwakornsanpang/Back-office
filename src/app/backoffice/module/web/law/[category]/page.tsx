// src/app/backoffice/web/law/[category]/page.tsx
"use client";

import { useParams } from "next/navigation";
import {
  Save,
  Plus,
  Trash2,
  FileText,
  Download,
  UploadCloud,
  Edit,
  X,
} from "lucide-react"; // เพิ่ม Edit icon
import { useState, useEffect, useRef } from "react";
import styles from "./law.module.css";
import Swal from "sweetalert2"; // 🔥 เรียกใช้ SweetAlert2
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LAW_TITLES: Record<string, string> = {
  law1: "พระราชบัญญัติวิชาชีพเภสัชกรรม",
  law2: "ข้อบังคับสภาเภสัชกรรม",
  law3: "ประกาศสภาเภสัชกรรม",
  law4: "กฎกระทรวง",
  law5: "กฎหมายอื่นที่เกี่ยวข้อง",
  law6: "คำสั่งสภาเภสัชกรรม",
  law7: "ระเบียบสภาเภสัชกรรม",
};

interface LawItem {
  id: number;
  title: string;
  announcedAt: string;
  order: number;
  pdfUrl: string;
}

export default function LawDynamicPage() {
  const params = useParams();
  const categorySlug =
    (Array.isArray(params.category) ? params.category[0] : params.category) ||
    "";
  const titleTH = LAW_TITLES[categorySlug] || categorySlug;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [laws, setLaws] = useState<LawItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // State สำหรับโหมดแก้ไข
  const [editId, setEditId] = useState<number | null>(null); // ถ้ามีค่า = กำลังแก้ไข

  const [formData, setFormData] = useState<{
    title: string;
    announcedAt: string;
    order: number | string; // 🔥 เพิ่ม | string เข้าไป
  }>({
    title: "",
    announcedAt: "",
    order: 0,
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const fetchLaws = async () => {
    if (!API_URL) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/laws/${categorySlug}`);
      if (!res.ok) {
        setLaws([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) setLaws(data);
      else setLaws([]);
    } catch (err) {
      console.error(err);
      setLaws([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLaws();
  }, [categorySlug]);

  // ฟังก์ชันเริ่มการแก้ไข
  const handleEdit = (law: LawItem) => {
    setEditId(law.id);
    setFormData({
      title: law.title,
      announcedAt: law.announcedAt ? law.announcedAt.split("T")[0] : "",
      order: law.order,
    });
    setPdfFile(null); // รีเซ็ตไฟล์ (ถ้าไม่เลือกใหม่ ก็ใช้ของเดิมที่ Server)
    setIsAdding(true); // เปิดฟอร์ม

    // Scroll ไปที่ฟอร์มด้านบน
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditId(null);
    setFormData({ title: "", announcedAt: "", order: 0 });
    setPdfFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title) {
      MySwal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกชื่อกฎหมาย",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    // กรณีเพิ่มใหม่ ต้องมีไฟล์ PDF ด้วย
    if (!editId && !pdfFile) {
      MySwal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณาแนบไฟล์ PDF สำหรับการเพิ่มข้อมูลใหม่",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (!formData.announcedAt) {
      MySwal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณาระบุวันที่ประกาศ", // ข้อความเตือนภาษาไทยสวยๆ
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    // 🔥 Popup ยืนยันก่อนบันทึก
    const result = await MySwal.fire({
      title: editId ? "ยืนยันการแก้ไข?" : "ยืนยันการเพิ่มข้อมูล?",
      text: "ตรวจสอบความถูกต้องก่อนบันทึก",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, บันทึกเลย",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("category", categorySlug);
      data.append("title", formData.title);
      data.append("announcedAt", formData.announcedAt);
      data.append("order", formData.order.toString());
      if (pdfFile) {
        data.append("pdf", pdfFile);
      }

      // ถ้ามี editId ให้ยิง PUT, ถ้าไม่มีให้ยิง POST
      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API_URL}/laws/${editId}` : `${API_URL}/laws`;

      const res = await fetch(url, { method: method, body: data });

      if (res.ok) {
        // ✅ Success Popup
        await MySwal.fire({
          icon: "success",
          title: "สำเร็จ!",
          text: editId
            ? "แก้ไขข้อมูลเรียบร้อยแล้ว"
            : "เพิ่มข้อมูลเรียบร้อยแล้ว",
          timer: 1500,
          showConfirmButton: false,
        });

        handleCancel(); // ปิดฟอร์ม/ล้างค่า
        fetchLaws(); // โหลดข้อมูลใหม่
      } else {
        // ❌ Error Popup (กรณี Server ตอบกลับมาว่าไม่ผ่าน)
        const errorData = await res.json().catch(() => ({}));

        // เช็คว่าเป็นเคส "ไฟล์ใหญ่เกิน" หรือไม่ (Render/Fastify มักตัดการเชื่อมต่อหรือส่ง 413)
        if (res.status === 413) {
          throw new Error("ไฟล์มีขนาดใหญ่เกินไป (จำกัด 10MB)");
        }

        throw new Error(errorData.message || "บันทึกไม่สำเร็จ");
      }
    } catch (err: any) {
      console.error(err);
      // ❌ Error Popup (กรณี Network Error หรืออื่นๆ)
      MySwal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: err.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    // 🔥 Popup ยืนยันการลบ
    const result = await MySwal.fire({
      title: "คุณแน่ใจไหม?",
      text: "ข้อมูลที่ลบไปจะไม่สามารถกู้คืนได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/laws/${id}`, { method: "DELETE" });
      if (res.ok) {
        await MySwal.fire(
          "ลบสำเร็จ!",
          "ไฟล์ของคุณถูกลบเรียบร้อยแล้ว.",
          "success",
        );
        fetchLaws();
      } else {
        throw new Error("ลบไม่สำเร็จ");
      }
    } catch (err) {
      MySwal.fire("Error!", "เกิดข้อผิดพลาดในการลบ", "error");
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2>
            <FileText className="text-blue-600" size={32} />
            {titleTH}
          </h2>
          <p className={styles.breadcrumb}>
            หน้าเว็บ / กฎหมาย /{" "}
            <span className="text-blue-600 font-medium">{titleTH}</span>
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className={styles.mainActionBtn}
          >
            <Plus size={20} /> เพิ่มข้อมูลใหม่
          </button>
        )}
      </div>

      {/* Form Section */}
      {isAdding && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            {/* เปลี่ยนหัวข้อตามโหมด */}
            <h3 className={styles.formTitle}>
              {editId ? "แก้ไขข้อมูลกฎหมาย" : "เพิ่มข้อมูลกฎหมายใหม่"}
            </h3>
          </div>

          <div className={styles.formBody}>
            <div className={styles.formGrid}>
              {/* Left Column */}
              <div className="space-y-6">
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    ชื่อกฎหมาย <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="ระบุชื่อกฎหมาย..."
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>วันที่ประกาศ</label>
                    <input
                      type="date"
                      className={styles.input}
                      value={formData.announcedAt}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          announcedAt: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>ลำดับแสดงผล</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.order}
                      onChange={(e) => {
                        const val = e.target.value;
                        // ถ้าเป็นค่าว่าง ให้ใส่ '' ลงไปเลย (User จะได้ลบจนเกลี้ยงได้)
                        // ถ้ามีค่า ค่อยแปลงเป็นตัวเลข
                        setFormData({
                          ...formData,
                          order: val === "" ? "" : parseInt(val),
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Upload */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  {editId
                    ? "เปลี่ยนไฟล์ PDF (เว้นว่างหากใช้ไฟล์เดิม)"
                    : "แนบไฟล์ PDF *"}
                </label>
                <div
                  className={styles.fileUploadBox}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />

                  {pdfFile ? (
                    <>
                      <div className="p-3 bg-red-50 rounded-full text-red-500">
                        <FileText size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">
                          {pdfFile.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPdfFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="text-xs text-red-500 hover:underline mt-2"
                      >
                        ยกเลิกไฟล์นี้
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-blue-50 rounded-full text-blue-500">
                        <UploadCloud size={32} />
                      </div>
                      <div>
                        <p className={styles.fileUploadText}>
                          คลิกเพื่อ{editId ? "เปลี่ยนไฟล์" : "อัปโหลดไฟล์"}
                        </p>
                        <p className={styles.fileUploadHint}>
                          รองรับไฟล์ PDF (ไม่เกิน 10MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.formActions}>
              <button onClick={handleCancel} className={styles.cancelBtn}>
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={styles.saveBtn}
              >
                <Save size={18} />
                {isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "80px", textAlign: "center" }}>ลำดับ</th>
              <th>ชื่อกฎหมาย</th>
              <th style={{ width: "150px" }}>วันที่ประกาศ</th>
              <th style={{ width: "120px" }}>เอกสาร</th>
              <th style={{ width: "120px", textAlign: "center" }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {/* 🔥 เคสที่ 1: กำลังโหลด (โชว์ Loading ก่อน) */}
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2 animate-pulse">
                    {/* ใส่ Spinner หรือข้อความโหลดตรงนี้ */}
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span>กำลังโหลดข้อมูล...</span>
                  </div>
                </td>
              </tr>
            ) : laws.length === 0 ? (
              /* 🔥 เคสที่ 2: โหลดเสร็จแล้ว แต่ไม่มีข้อมูลจริงๆ (ค่อยโชว์อันนี้) */
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-12">
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={48} className="opacity-20" />
                    <span>ยังไม่มีข้อมูลในหมวดนี้</span>
                  </div>
                </td>
              </tr>
            ) : (
              /* 🔥 เคสที่ 3: มีข้อมูล (แสดงรายการปกติ) */
              laws.map((law) => (
                <tr key={law.id}>
                  {/* ... (โค้ดแสดงแถวข้อมูลเดิมของคุณ) ... */}
                  <td className="text-center font-medium text-gray-500">
                    {law.order}
                  </td>
                  <td className="font-medium text-gray-700">{law.title}</td>
                  <td>
                    {law.announcedAt
                      ? new Date(law.announcedAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                      : "-"}
                  </td>
                  <td>
                    {law.pdfUrl && (
                      <a
                        href={law.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.pdfLink}
                      >
                        <Download size={16} />
                        <span>PDF</span>
                      </a>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(law)}
                        className={`${styles.deleteBtn} !border-blue-300 !text-blue-600 hover:!bg-blue-50`}
                        title="แก้ไข"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(law.id)}
                        className={styles.deleteBtn}
                        title="ลบข้อมูล"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
