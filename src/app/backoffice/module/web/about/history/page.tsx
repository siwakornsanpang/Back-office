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
  Search,
} from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import styles from "../council/council.module.css"; // ใช้ CSS ตัวเดียวกับหน้า Council ได้เลย หรือก๊อปมาวาง
import { authFetch } from '@/app/utils/authFetch';

const MySwal = withReactContent(Swal);
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface HistoryItem {
  id: number;
  term: string;
  years: string;
  presidentName: string;
  secretaryName: string;
  presidentImage: string | null;
  secretaryImage: string | null;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- 🔥 1. เพิ่ม State สำหรับค้นหา ---
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const getSortIcon = () => {
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // --- 🔥 2. Logic กรองและเรียงข้อมูล (Filter & Sort) ---
  const filteredItems = useMemo(() => {
    let result = [...items];

    // 2.1 กรองข้อมูลตามคำค้นหา
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.presidentName.toLowerCase().includes(lowerTerm) ||
          item.secretaryName.toLowerCase().includes(lowerTerm) ||
          item.years.includes(lowerTerm) ||
          item.term.includes(lowerTerm),
      );
    }

    // 2.2 เรียงลำดับ (ใช้ Logic วาระที่เป็นตัวเลข)
    result.sort((a, b) => {
      const aVal = parseInt(a.term) || 0;
      const bVal = parseInt(b.term) || 0;
      if (sortDirection === "asc") return aVal - bVal;
      return bVal - aVal;
    });

    return result;
  }, [items, searchTerm, sortDirection]);

  // Form Data (มี 2 รูป)
  const [formData, setFormData] = useState<{
    term: string;
    years: string;
    presidentName: string;
    secretaryName: string;
    presidentFile: File | null;
    secretaryFile: File | null;
    presidentPreview: string | null;
    secretaryPreview: string | null;
  }>({
    term: "",
    years: "",
    presidentName: "",
    secretaryName: "",
    presidentFile: null,
    secretaryFile: null,
    presidentPreview: null,
    secretaryPreview: null,
  });

  const fetchItems = async () => {
    try {
      const res = await authFetch(`${API_URL}/history`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openModal = (item?: HistoryItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        term: item.term,
        years: item.years,
        presidentName: item.presidentName,
        secretaryName: item.secretaryName,
        presidentFile: null,
        secretaryFile: null,
        presidentPreview: item.presidentImage,
        secretaryPreview: item.secretaryImage,
      });
    } else {
      setEditingId(null);
      setFormData({
        term: "",
        years: "",
        presidentName: "",
        secretaryName: "",
        presidentFile: null,
        secretaryFile: null,
        presidentPreview: null,
        secretaryPreview: null,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    MySwal.fire({ title: "กำลังบันทึก...", didOpen: () => Swal.showLoading() });
    try {
      const form = new FormData();
      form.append("term", formData.term);
      form.append("years", formData.years);
      form.append("presidentName", formData.presidentName);
      form.append("secretaryName", formData.secretaryName);

      // ส่งรูปเฉพาะที่มีการเปลี่ยน/เพิ่ม
      if (formData.presidentFile)
        form.append("presidentImage", formData.presidentFile);
      if (formData.secretaryFile)
        form.append("secretaryImage", formData.secretaryFile);

      const url = editingId
        ? `${API_URL}/history/${editingId}`
        : `${API_URL}/history`;
      const method = editingId ? "PUT" : "POST";

      const res = await authFetch(url, { method, body: form });
      if (res.ok) {
        await MySwal.fire("สำเร็จ", "บันทึกข้อมูลเรียบร้อย", "success");
        setIsModalOpen(false);
        fetchItems();
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
      await authFetch(`${API_URL}/history/${id}`, { method: "DELETE" });
      fetchItems();
      MySwal.fire("ลบสำเร็จ", "", "success");
    }
  };

  // Component ย่อยสำหรับอัปโหลดรูป (เหมือน council)
  const ImageUploader = ({ label, preview, onFileChange }: any) => (
    <div className={styles.imageUploadContainer}>
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <label className={styles.imageUploadLabel}>
        <input
          type="file"
          hidden
          accept="image/*"
          onClick={(e) => {
            (e.target as HTMLInputElement).value = "";
          }}
          onChange={onFileChange}
        />
        <div className={styles.circleWrapper}>
          {preview ? (
            <>
              <img
                src={preview}
                className={styles.previewImage}
                alt="Preview"
              />
              <div className={styles.uploadOverlay}>
                <ImageIcon size={24} />
                <span className="text-xs font-medium mt-1">เปลี่ยนรูป</span>
              </div>
            </>
          ) : (
            <div className={styles.placeholderContent}>
              <UploadCloud size={32} />
              <span className="text-xs">เพิ่มรูปภาพ</span>
            </div>
          )}
        </div>
        <span className={styles.helperText}>
          {preview ? (
            <>
              <Edit size={14} /> คลิกที่รูปเพื่อเปลี่ยน
            </>
          ) : (
            "คลิกเพื่ออัปโหลดรูปภาพ"
          )}
        </span>
      </label>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>ทำเนียบสภาเภสัชกรรม</h1>
          <p className={styles.subtitle}>
            จัดการข้อมูลวาระ, ปีที่ดำรงตำแหน่ง, นายก และเลขาธิการ
          </p>
        </div>
      </div>

      <div className={styles.toolbar}>
        {/* ช่องค้นหา */}
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="ค้นหาวาระ, ชื่อ, หรือปี..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ปุ่มเพิ่มข้อมูล (ย้ายมาไว้ตรงนี้) */}
        <button onClick={() => openModal()} className={styles.btnAdd}>
          <Plus size={20} /> เพิ่มวาระใหม่
        </button>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHead}>
                <th
                  className={`${styles.tableTh} ${styles.thSortable} text-center w-20`}
                  onClick={handleSort}
                >
                  วาระ{" "}
                  <span className={styles.sortIconActive}>{getSortIcon()}</span>
                </th>
                <th className={`${styles.tableTh} w-32`}>ปี (พ.ศ.)</th>
                <th className={`${styles.tableTh} text-center w-32`}>
                  รูปนายก
                </th>
                <th className={styles.tableTh}>ชื่อนายกสภา</th>
                <th className={`${styles.tableTh} text-center w-32`}>
                  รูปเลขา
                </th>
                <th className={styles.tableTh}>ชื่อเลขาธิการ</th>
                <th className={`${styles.tableTh} text-center w-24`}>จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className={styles.tableRow}>
                  <td className="p-4 text-center font-bold text-blue-600 text-lg">
                    {item.term}
                  </td>
                  <td className="p-4 text-gray-600">{item.years}</td>

                  {/* รูปนายก */}
                  <td className={styles.tableTd}>
                    <div className={styles.imageCell}>
                      <div
                        className={`${styles.avatarContainer} ${item.presidentImage ? styles.clickableAvatar : ""}`}
                        onClick={() =>
                          item.presidentImage &&
                          setPreviewImage(item.presidentImage)
                        }
                        title={
                          item.presidentImage ? "คลิกเพื่อดูรูปขนาดเต็ม" : ""
                        }
                      >
                        {item.presidentImage ? (
                          <>
                            <img
                              src={item.presidentImage}
                              className={styles.avatarImg}
                            />
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
                      {item.presidentImage && (
                        <span
                          className={styles.viewImageLabel}
                          onClick={() => setPreviewImage(item.presidentImage!)}
                        >
                          <ZoomIn size={12} /> ดูภาพเต็ม
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium">{item.presidentName}</td>

                  {/* รูปเลขา */}
                  <td className={styles.tableTd}>
                    <div className={styles.imageCell}>
                      <div
                        className={`${styles.avatarContainer} ${item.secretaryImage ? styles.clickableAvatar : ""}`}
                        onClick={() =>
                          item.secretaryImage &&
                          setPreviewImage(item.secretaryImage)
                        }
                        title={
                          item.secretaryImage ? "คลิกเพื่อดูรูปขนาดเต็ม" : ""
                        }
                      >
                        {item.secretaryImage ? (
                          <>
                            <img
                              src={item.secretaryImage}
                              className={styles.avatarImg}
                            />
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
                      {item.secretaryImage && (
                        <span
                          className={styles.viewImageLabel}
                          onClick={() => setPreviewImage(item.secretaryImage!)}
                        >
                          <ZoomIn size={12} /> ดูภาพเต็ม
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium">{item.secretaryName}</td>

                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openModal(item)}
                        className={styles.btnIconEdit}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className={styles.btnIconDelete}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ maxWidth: "40rem" }}>
            {" "}
            {/* ขยาย Modal หน่อยเพราะข้อมูลเยอะ */}
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingId ? "แก้ไขข้อมูล" : "เพิ่มข้อมูลทำเนียบ"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.btnClose}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {/* แถว 1: วาระ + ปี */}
              <div className={styles.gridTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>วาระที่</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    placeholder="เช่น 13"
                    value={formData.term}
                    onChange={(e) =>
                      setFormData({ ...formData, term: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>ปีที่ดำรงตำแหน่ง</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    placeholder="เช่น 2568-2570"
                    value={formData.years}
                    onChange={(e) =>
                      setFormData({ ...formData, years: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 my-2"></div>

              {/* แถว 2: รูปภาพคู่ (นายก - เลขา) */}
              <div
                className={styles.gridTwo}
                style={{
                  justifyItems: "center",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                }}
              >
                <ImageUploader
                  label="รูปนายกสภา"
                  preview={formData.presidentPreview}
                  onFileChange={(e: any) =>
                    e.target.files[0] &&
                    setFormData({
                      ...formData,
                      presidentFile: e.target.files[0],
                      presidentPreview: URL.createObjectURL(e.target.files[0]),
                    })
                  }
                />

                <ImageUploader
                  label="รูปเลขาธิการ"
                  preview={formData.secretaryPreview}
                  onFileChange={(e: any) =>
                    e.target.files[0] &&
                    setFormData({
                      ...formData,
                      secretaryFile: e.target.files[0],
                      secretaryPreview: URL.createObjectURL(e.target.files[0]),
                    })
                  }
                />
              </div>

              {/* แถว 3: ชื่อนายก */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  ชื่อนายกสภา <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="ระบุชื่อนายก..."
                  value={formData.presidentName}
                  onChange={(e) =>
                    setFormData({ ...formData, presidentName: e.target.value })
                  }
                />
              </div>

              {/* แถว 4: ชื่อเลขา */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  ชื่อเลขาธิการ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="ระบุชื่อเลขา..."
                  value={formData.secretaryName}
                  onChange={(e) =>
                    setFormData({ ...formData, secretaryName: e.target.value })
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

      {/* Popup ดูรูปใหญ่ */}
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
