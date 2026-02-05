// src/app/backoffice/module/web/about/council/[category]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Save, User, Camera, Trash2, Users, ChevronDown } from "lucide-react"; // เพิ่ม ChevronDown สำหรับแต่ง Dropdown
import styles from "./page.module.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const POSITIONS = [
  "นายกสภาเภสัชกรรม",
  "อุปนายกสภาเภสัชกรรม",
  "นายกเภสัชกรรมสมาคมแห่งประเทศไทย",
  "เลขาธิการ สภาเภสัชกรรม",
  "รองเลขาธิการ สภาเภสัชกรรม",
  "ผู้ช่วยเลขาธิการ สภาเภสัชกรรม",
  "ปลัดกระทรวงสาธารณสุข",
  "คณบดีคณะเภสัชศาสตร์",
  "ประชาสัมพันธ์และโฆษก",
  "กรรมการ สภาเภสัชกรรม",
  "ผู้แทนกระทรวงสาธารณสุข",
  "ผู้แทนกระทรวงมหาดไทย",
  "ผู้แทนกระทรวงกลาโหม",
];

// ... (Interface CouncilSlot เหมือนเดิม) ...
interface CouncilSlot {
  dbId?: number;
  order: number;
  name: string;
  position: string;
  imageUrl: string | null;
  tempFile?: File | null;
  tempPreview?: string | null;
  isModified?: boolean;
}

export default function CouncilCategoryPage() {
  const params = useParams();
  const category =
    (Array.isArray(params.category) ? params.category[0] : params.category) ||
    "elected";
  const titleTH =
    category === "elected"
      ? "กรรมการเลือกตั้ง (12 ท่าน)"
      : "กรรมการแต่งตั้ง (12 ท่าน)";

  // ... (State slots และ fetchData เหมือนเดิม) ...
  const [slots, setSlots] = useState<CouncilSlot[]>(
    Array.from({ length: 12 }, (_, i) => ({
      order: i + 1,
      name: "",
      position: "",
      imageUrl: null,
    })),
  );

  const fetchData = async () => {
    if (!API_URL) return;
    try {
      const res = await fetch(`${API_URL}/council/${category}`);
      if (!res.ok) return;

      const data = await res.json();
      if (!Array.isArray(data)) return;

      setSlots((prevSlots) =>
        prevSlots.map((slot) => {
          const found = data.find((d: any) => d.order === slot.order);
          if (found) {
            return {
              ...slot,
              dbId: found.id,
              name: found.name,
              position: found.position,
              imageUrl: found.imageUrl,
              isModified: false,
              tempFile: null,
              tempPreview: null,
            };
          }
          return {
            ...slot,
            dbId: undefined,
            name: "",
            position: "",
            imageUrl: null,
            tempFile: null,
            tempPreview: null,
            isModified: false,
          };
        }),
      );
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]);

  const handleUpdate = (
    order: number,
    field: keyof CouncilSlot,
    value: any,
  ) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.order === order ? { ...s, [field]: value, isModified: true } : s,
      ),
    );
  };

  const handleFileChange = (order: number, file: File) => {
    const preview = URL.createObjectURL(file);
    setSlots((prev) =>
      prev.map((s) =>
        s.order === order
          ? {
              ...s,
              tempFile: file,
              tempPreview: preview,
              isModified: true,
            }
          : s,
      ),
    );
  };

  const handleSave = async (slot: CouncilSlot) => {
    if (!slot.name) {
      MySwal.fire("แจ้งเตือน", "กรุณาระบุชื่อก่อนบันทึก", "warning");
      return;
    }
    MySwal.fire({ title: "กำลังบันทึก...", didOpen: () => Swal.showLoading() });
    try {
      const formData = new FormData();
      formData.append("type", category);
      formData.append("order", slot.order.toString());
      formData.append("name", slot.name);
      formData.append("position", slot.position);
      if (slot.tempFile) formData.append("image", slot.tempFile);

      const res = await fetch(`${API_URL}/council/save`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await MySwal.fire({
          icon: "success",
          title: "บันทึกเรียบร้อย",
          timer: 1000,
          showConfirmButton: false,
        });
        fetchData();
      } else {
        throw new Error();
      }
    } catch (err) {
      MySwal.fire("Error", "บันทึกไม่สำเร็จ", "error");
    }
  };

  const handleClear = async (slot: CouncilSlot) => {
    if (!slot.dbId && !slot.name && !slot.imageUrl) return;

    const result = await MySwal.fire({
      title: `ยืนยันการลบข้อมูล?`,
      text: `ข้อมูลในลำดับที่ ${slot.order} จะถูกล้างออก`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      MySwal.fire({ title: "กำลังลบ...", didOpen: () => Swal.showLoading() });
      try {
        if (slot.dbId) {
          await fetch(`${API_URL}/council/clear`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: category, order: slot.order }),
          });
        }
        await MySwal.fire({
          icon: "success",
          title: "ลบเรียบร้อย",
          timer: 1000,
          showConfirmButton: false,
        });
        fetchData();
      } catch (err) {
        MySwal.fire("Error", "ลบไม่สำเร็จ", "error");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Users className="text-blue-600" size={32} />
          <div>
            <h2>{titleTH}</h2>
            <p className="text-sm text-gray-500">จัดการข้อมูล 12 ท่าน</p>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {slots.map((slot) => (
          <div key={slot.order} className={styles.card}>
            <div className={styles.imageArea}>
              <span className={styles.slotLabel}>#{slot.order}</span>
              {slot.tempPreview || slot.imageUrl ? (
                <img
                  src={slot.tempPreview || slot.imageUrl!}
                  alt={slot.name}
                  className={styles.memberImage}
                />
              ) : (
                <div className="flex flex-col items-center text-gray-300">
                  <User size={64} strokeWidth={1} />
                  <span className="text-xs mt-2">ไม่มีรูปภาพ</span>
                </div>
              )}
              <label className={styles.uploadOverlay}>
                <div className={styles.uploadBtn}>
                  <Camera size={16} /> เลือกรูป
                </div>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  // 🔥 เพิ่มบรรทัดนี้ครับ: ล้างค่าไฟล์เก่าทิ้งทันทีที่กดคลิก
                  onClick={(e) => {
                    (e.target as HTMLInputElement).value = "";
                  }}
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      handleFileChange(slot.order, e.target.files[0]);
                  }}
                />
              </label>
            </div>

            <div className={styles.infoArea}>
              <input
                type="text"
                className={styles.inputName}
                placeholder="ระบุชื่อ-นามสกุล..."
                value={slot.name}
                onChange={(e) =>
                  handleUpdate(slot.order, "name", e.target.value)
                }
              />

              {/* 🔥 เปลี่ยนเป็น Select Dropdown */}
              <div className="relative w-full">
                <select
                  className={styles.selectPosition}
                  value={slot.position}
                  onChange={(e) =>
                    handleUpdate(slot.order, "position", e.target.value)
                  }
                >
                  <option value="">-- ระบุตำแหน่ง --</option>
                  {POSITIONS.map((pos, index) => (
                    <option key={index} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
                {/* ไอคอนลูกศรตกแต่ง (Optional) */}
              </div>

              <div className={styles.actions}>
                {slot.isModified && (
                  <button
                    className={styles.saveBtn}
                    onClick={() => handleSave(slot)}
                    title="บันทึก"
                  >
                    <Save size={20} />
                  </button>
                )}
                {(slot.name || slot.imageUrl) && (
                  <button
                    className={styles.clearBtn}
                    onClick={() => handleClear(slot)}
                    title="ล้างข้อมูล"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
