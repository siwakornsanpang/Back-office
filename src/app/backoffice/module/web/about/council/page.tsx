// src/app/backoffice/module/web/about/council/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Edit,
  Trash2,
  Plus,
  User,
  ImageIcon,
  UploadCloud,
  X,
  ZoomIn,
} from "lucide-react"; // เพิ่ม UploadCloud icon
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
// 1. นำเข้า CSS Module
import styles from "./page.module.css";

const MySwal = withReactContent(Swal);
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CouncilMember {
  id: number;
  name: string;
  position: string;
  type: "elected" | "appointed";
  imageUrl: string | null;
  order: number;
}

export default function CouncilPage() {
  const [members, setMembers] = useState<CouncilMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sorting
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getSortIcon = () => {
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (sortDirection === 'asc') return a.order - b.order;
      return b.order - a.order;
    });
  }, [members, sortDirection]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    position: string;
    type: string;
    order: number | string;
    file: File | null;
    preview: string | null;
  }>({
    name: "",
    position: "",
    type: "elected",
    order: 1,
    file: null,
    preview: null,
  });

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_URL}/council`);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openModal = (member?: CouncilMember) => {
    if (member) {
      // ✅ โหมดแก้ไข: ต้องดึง URL รูปเดิมมาใส่ใน preview ด้วย
      setEditingId(member.id);
      setFormData({
        name: member.name,
        position: member.position,
        type: member.type,
        order: member.order,
        file: null,
        preview: member.imageUrl || null, // 🔥 แก้ตรงนี้! (ถ้ามีรูปเดิม ให้เอามาใส่ ถ้าไม่มีเป็น null)
      });
    } else {
      // ✅ โหมดเพิ่มใหม่: preview เป็น null (ว่างเปล่า)
      setEditingId(null);
      // Auto increment order
      const maxOrder =
        members.length > 0 ? Math.max(...members.map((m) => m.order)) : 0;
      setFormData({
        name: "",
        position: "",
        type: "elected",
        order: maxOrder + 1,
        file: null,
        preview: null,
      });
    }
    setIsModalOpen(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    MySwal.fire({ title: "กำลังบันทึก...", didOpen: () => Swal.showLoading() });
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("position", formData.position);
      form.append("type", formData.type);
      form.append("order", formData.order.toString());
      if (formData.file) form.append("image", formData.file);

      const url = editingId
        ? `${API_URL}/council/${editingId}`
        : `${API_URL}/council`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, { method, body: form });
      if (res.ok) {
        await MySwal.fire("สำเร็จ", "บันทึกข้อมูลเรียบร้อย", "success");
        setIsModalOpen(false);
        fetchMembers();
      } else {
        throw new Error();
      }
    } catch (err) {
      MySwal.fire("Error", "เกิดข้อผิดพลาด", "error");
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await MySwal.fire({
      title: "ยืนยันการลบ?",
      text: "ข้อมูลจะถูกลบถาวร",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "ลบข้อมูล",
    });

    if (confirm.isConfirmed) {
      await fetch(`${API_URL}/council/${id}`, { method: "DELETE" });
      fetchMembers();
      MySwal.fire("ลบสำเร็จ", "", "success");
    }
  };

  return (
    // 2. แทนที่ ClassName ด้วย styles.xxx
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>จัดการข้อมูลกรรมการสภา</h1>
          <p className={styles.subtitle}>
            รวมรายชื่อทั้ง เลือกตั้ง และ แต่งตั้ง
          </p>
        </div>
        <button onClick={() => openModal()} className={styles.btnAdd}>
          <Plus size={20} /> เพิ่มข้อมูลใหม่
        </button>
      </div>

      {/* Table Card */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHead}>
                <th className={`${styles.tableTh} ${styles.thSortable} text-center w-16`} onClick={handleSort}>
                  ลำดับ <span className={styles.sortIconActive}>{getSortIcon()}</span>
                </th>
                <th className={`${styles.tableTh} text-center w-24`}>รูปภาพ</th>
                <th className={styles.tableTh}>ชื่อ-นามสกุล</th>
                <th className={styles.tableTh}>ตำแหน่ง</th>
                <th className={styles.tableTh}>ประเภท</th>
                <th className={`${styles.tableTh} text-center w-32`}>จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    ยังไม่มีข้อมูล
                  </td>
                </tr>
              ) : (
                sortedMembers.map((member) => (
                  <tr key={member.id} className={styles.tableRow}>
                    <td className={`${styles.tableTd} text-center`}>
                      <span className={styles.orderBadge}>{member.order}</span>
                    </td>
                    <td className={styles.tableTd}>
                      <div className={styles.imageCell}>
                        <div
                          className={`${styles.avatarContainer} ${member.imageUrl ? styles.clickableAvatar : ""}`}
                          onClick={() => {
                            if (member.imageUrl)
                              setPreviewImage(member.imageUrl);
                          }}
                          title={
                            member.imageUrl ? "คลิกเพื่อดูรูปขนาดเต็ม" : ""
                          }
                        >
                          {member.imageUrl ? (
                            <>
                              <img
                                src={member.imageUrl}
                                alt={member.name}
                                className={styles.avatarImg}
                              />
                              {/* 🔥 เพิ่ม Overlay แว่นขยายตรงนี้ */}
                              <div className={styles.zoomOverlay}>
                                <ZoomIn size={16} />
                              </div>
                            </>
                          ) : (
                            <User
                              size={20}
                              className={styles.avatarPlaceholder}
                            />
                          )}
                        </div>
                        {member.imageUrl && (
                          <span
                            className={styles.viewImageLabel}
                            onClick={() => setPreviewImage(member.imageUrl!)}
                          >
                            <ZoomIn size={12} /> ดูภาพเต็ม
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      className={`${styles.tableTd} font-medium text-gray-900`}
                    >
                      {member.name}
                    </td>
                    <td className={`${styles.tableTd} text-gray-600`}>
                      {member.position}
                    </td>
                    <td className={styles.tableTd}>
                      {/* 3. ใช้ Conditional ClassName สำหรับ Badge */}
                      <span
                        className={
                          member.type === "elected"
                            ? styles.badgeElected
                            : styles.badgeAppointed
                        }
                      >
                        {member.type === "elected"
                          ? "🗳️ การเลือกตั้ง"
                          : "📜 การแต่งตั้ง"}
                      </span>
                    </td>
                    <td className={`${styles.tableTd} text-center`}>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openModal(member)}
                          className={styles.btnIconEdit}
                          title="แก้ไข"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className={styles.btnIconDelete}
                          title="ลบ"
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

      {/* --- Modal (Popup) --- */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingId ? "แก้ไขข้อมูล" : "เพิ่มรายชื่อใหม่"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.btnClose}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {/* 🔥 4. REDESIGNED IMAGE UPLOAD SECTION 🔥 */}
              <div className={styles.imageUploadContainer}>
                <label className={styles.imageUploadLabel}>
                  {/* Input ซ่อนอยู่เหมือนเดิม */}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onClick={(e) => {
                      (e.target as HTMLInputElement).value = "";
                    }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFormData({
                          ...formData,
                          file: e.target.files[0],
                          preview: URL.createObjectURL(e.target.files[0]),
                        });
                      }
                    }}
                  />

                  {/* กรอบวงกลม */}
                  <div className={styles.circleWrapper}>
                    {formData.preview ? (
                      // กรณี 1: มีรูปแล้ว
                      <>
                        <img
                          src={formData.preview}
                          className={styles.previewImage}
                          alt="Preview"
                        />
                        {/* Overlay ตอนเอาเมาส์ชี้ */}
                        <div className={styles.uploadOverlay}>
                          <ImageIcon size={24} />
                          <span className="text-xs font-medium mt-1">
                            เปลี่ยนรูป
                          </span>
                        </div>
                      </>
                    ) : (
                      // กรณี 2: ยังไม่มีรูป
                      <div className={styles.placeholderContent}>
                        <UploadCloud size={32} />
                        <span className="text-xs">เพิ่มรูปภาพ</span>
                      </div>
                    )}
                  </div>

                  {/* ข้อความใต้รูป (แสดงตลอดเวลา) */}
                  <span className={styles.helperText}>
                    {formData.preview ? (
                      <>
                        <Edit size={14} /> คลิกที่รูปเพื่อเปลี่ยน
                      </>
                    ) : (
                      "คลิกเพื่ออัปโหลดรูปภาพ"
                    )}
                  </span>
                </label>
              </div>

              <div className={styles.gridTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>ประเภท</label>
                  <select
                    className={styles.formSelect}
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="elected">🗳️ การเลือกตั้ง</option>
                    <option value="appointed">📜 การแต่งตั้ง</option>
                  </select>
                </div>
                <div>
                  <label className={styles.formLabel}>ลำดับ (Sorting)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={formData.order}
                    onChange={(e) => {
                      const val = e.target.value;
                      // 🔥 แก้ตรงนี้: ถ้าเป็นค่าว่าง ให้ใส่ว่างไปเลย ไม่ต้องใส่ 0
                      setFormData({
                        ...formData,
                        order: val === "" ? "" : parseInt(val),
                      });
                    }}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="เช่น ภก.สมชาย ใจดี"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  ตำแหน่ง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="เช่น นายกสภา..."
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.btnCancel}
                >
                  ยกเลิก
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {previewImage && (
        <div
          className={styles.imagePreviewOverlay}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className={styles.imagePreviewContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closePreviewBtn}
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
              title="ปิด"
            >
              <X size={32} />
            </button>
            <img
              src={previewImage}
              alt="Full Size"
              className={styles.fullSizeImage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
