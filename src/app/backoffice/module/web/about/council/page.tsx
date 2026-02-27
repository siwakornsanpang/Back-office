// src/app/backoffice/module/web/about/council/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Edit,
  Trash2,
  Plus,
  User,
  ImageIcon,
  Upload,
  UploadCloud,
  X,
  ZoomIn,
  ZoomOut,
  Search,
  FileText,
  Crop,
} from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import styles from "./council.module.css";
import { authFetch } from '@/app/utils/authFetch';
import ImagePreviewModal from '@/app/components/ui/ImagePreviewModal';
import CrudModal from '@/app/components/ui/CrudModal';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../../../../components/editor/cropImage';

const MySwal = withReactContent(Swal);
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CouncilMember {
  id: number;
  name: string;
  position: string;
  type: "elected" | "appointed";
  imageUrl: string | null;
  originalImageUrl?: string | null;
  order: number;
  background?: string;
}

export default function CouncilPage() {
  const [members, setMembers] = useState<CouncilMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPosition, setFilterPosition] = useState("");

  const [viewingBio, setViewingBio] = useState<{
    name: string;
    text: string;
  } | null>(null);

  // Sorting
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const uniquePositions = useMemo(() => {
    const positions = Array.from(new Set(members.map((m) => m.position)));
    return positions.sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members
      .filter((member) => {
        const searchLower = searchTerm.toLowerCase();
        const matchSearch =
          member.name.toLowerCase().includes(searchLower) ||
          member.position.toLowerCase().includes(searchLower);
        const matchType = filterType ? member.type === filterType : true;
        const matchPosition = filterPosition
          ? member.position === filterPosition
          : true;
        return matchSearch && matchType && matchPosition;
      })
      .sort((a, b) => {
        if (sortDirection === "asc") return a.order - b.order;
        return b.order - a.order;
      });
  }, [members, searchTerm, filterType, filterPosition, sortDirection]);

  const handleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const getSortIcon = () => {
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    position: string;
    type: string;
    order: number | string;
    background: string;
    file: File | null;
    originalFile: File | null;
    preview: string | null;
    originalPreview: string | null;
  }>({
    name: "",
    position: "",
    type: "elected",
    order: 1,
    background: "",
    file: null,
    originalFile: null,
    preview: null,
    originalPreview: null,
  });

  const [isCropping, setIsCropping] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = (_: any, pixels: any) => setCroppedAreaPixels(pixels);

  const handleConfirmCrop = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    try {
      const croppedFile = await getCroppedImg(imageToCrop, croppedAreaPixels, `council-${Date.now()}.jpg`);
      if (!croppedFile) throw new Error("Crop failed");
      const croppedUrl = URL.createObjectURL(croppedFile);
      setFormData(prev => ({ ...prev, preview: croppedUrl, file: croppedFile }));
      setIsCropping(false);
      setImageToCrop(null);
    } catch (e) {
      console.error(e);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถตัดรูปภาพได้", "error");
    }
  };

  const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, originalPreview: imageUrl, originalFile: file }));
      setImageToCrop(imageUrl);
      setIsCropping(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      e.target.value = '';
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await authFetch(`${API_URL}/council`);
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
      setEditingId(member.id);
      setFormData({
        name: member.name,
        position: member.position,
        type: member.type,
        order: member.order,
        background: member.background || "",
        file: null,
        originalFile: null,
        preview: member.imageUrl || null,
        originalPreview: member.originalImageUrl || member.imageUrl || null,
      });
    } else {
      setEditingId(null);
      const maxOrder =
        members.length > 0 ? Math.max(...members.map((m) => m.order)) : 0;
      setFormData({
        name: "",
        position: "",
        type: "elected",
        order: maxOrder + 1,
        background: "",
        file: null,
        originalFile: null,
        preview: null,
        originalPreview: null,
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
      form.append("background", formData.background);
      if (formData.file) form.append("image", formData.file);
      if (formData.originalFile) form.append("originalImage", formData.originalFile);

      const url = editingId
        ? `${API_URL}/council/${editingId}`
        : `${API_URL}/council`;
      const method = editingId ? "PUT" : "POST";

      const res = await authFetch(url, { method, body: form });
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
      await authFetch(`${API_URL}/council/${id}`, { method: "DELETE" });
      fetchMembers();
      MySwal.fire("ลบสำเร็จ", "", "success");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>จัดการข้อมูลกรรมการสภา</h1>
          <p className={styles.subtitle}>
            รวมรายชื่อทั้ง เลือกตั้ง และ แต่งตั้ง
          </p>
        </div>
      </div>
      
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="ค้นหาชื่อ, ตำแหน่ง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
        >
          <option value="">ทุกตำแหน่ง</option>
          {uniquePositions.map((pos, idx) => (
            <option key={idx} value={pos}>
              {pos}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">ทุกประเภท</option>
          <option value="elected">🗳️ การเลือกตั้ง</option>
          <option value="appointed">📜 การแต่งตั้ง</option>
        </select>

        <button onClick={() => openModal()} className={styles.btnAdd}>
          <Plus size={20} /> เพิ่มข้อมูลใหม่
        </button>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHead}>
                {/* 1. ลำดับ */}
                <th
                  className={`${styles.tableTh} ${styles.thSortable} text-center w-16`}
                  onClick={handleSort}
                >
                  ลำดับ{" "}
                  <span className={styles.sortIconActive}>{getSortIcon()}</span>
                </th>
                {/* 2. รูปภาพ */}
                <th className={`${styles.tableTh} text-center w-24`}>รูปภาพ</th>
                {/* 3. ชื่อ */}
                <th className={styles.tableTh}>ชื่อ-นามสกุล</th>
                {/* 4. ตำแหน่ง */}
                <th className={styles.tableTh}>ตำแหน่ง</th>
                {/* 5. ประเภท */}
               <th className={`${styles.tableTh} text-center`}>ประเภท</th>
                {/* 6. ประวัติ */}
                <th className={`${styles.tableTh} text-center w-32`}>ประวัติ</th>
                {/* 7. จัดการ */}
                <th className={`${styles.tableTh} text-center w-32`}>จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    ยังไม่มีข้อมูล
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className={styles.tableRow}>
                    {/* 1. ลำดับ */}
                    <td className={`${styles.tableTd} text-center`}>
                      <span className={styles.orderBadge}>{member.order}</span>
                    </td>
                    
                    {/* 2. รูปภาพ */}
                    <td className={styles.tableTd}>
                      <div className={styles.imageCell}>
                        <div
                          className={`${styles.avatarContainer} ${member.imageUrl ? styles.clickableAvatar : ""}`}
                          onClick={() => {
                            if (member.imageUrl) setPreviewImage(member.imageUrl);
                          }}
                        >
                          {member.imageUrl ? (
                            <>
                              <img
                                src={member.imageUrl}
                                alt={member.name}
                                className={styles.avatarImg}
                              />
                              <div className={styles.zoomOverlay}>
                                <ZoomIn size={16} />
                              </div>
                            </>
                          ) : (
                            <User size={20} className={styles.avatarPlaceholder} />
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

                    {/* 3. ชื่อ */}
                    <td className={`${styles.tableTd} font-medium text-gray-900`}>
                      {member.name}
                    </td>

                    {/* 4. ตำแหน่ง */}
                    <td className={`${styles.tableTd} text-gray-600`}>
                      {member.position}
                    </td>

                    {/* 5. ประเภท */}
                    <td className={`${styles.tableTd} text-center`}>
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

                    {/* 6. ประวัติ (แก้ให้ตรงกลาง) */}
                    <td className={`${styles.tableTd} text-center`}>
                      {member.background && member.background.trim() !== "" ? (
                        <button
                          type="button"
                          className={styles.btnReadBio}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setViewingBio({
                              name: member.name,
                              text: member.background!,
                            });
                          }}
                        >
                          <FileText size={14} /> อ่านประวัติ
                        </button>
                      ) : (
                        <span className={styles.btnReadBioDisabled}>-</span>
                      )}
                    </td>

                    {/* 7. จัดการ (แก้ให้ตรงกลาง) */}
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

      {/* CRUD Modal */}
      <CrudModal
        isOpen={isModalOpen}
        title={editingId ? "แก้ไขข้อมูล" : "เพิ่มรายชื่อใหม่"}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <label className={styles.modalUploadArea}>
            {formData.preview ? (
              <img src={formData.preview} className={styles.modalPreviewImage} />
            ) : (
              <div className={styles.modalUploadPlaceholder}>
                <Upload size={36} /><span>คลิกเพื่ออัปโหลดรูปภาพ</span>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>แนะนำขนาด 4:3</span>
              </div>
            )}
            <input type="file" hidden accept="image/*" onChange={onSelectImage} />
          </label>
          {formData.preview && (
            <div className={styles.imageActionRow}>
              <button type="button" onClick={() => { setImageToCrop(formData.originalPreview || formData.preview); setIsCropping(true); setCrop({ x: 0, y: 0 }); setZoom(1); }} className={styles.changeImageBtn}>
                <Crop size={14} /> ครอปใหม่
              </button>
              <button type="button" onClick={() => document.querySelector<HTMLInputElement>(`.${styles.modalUploadArea} input`)?.click()} className={styles.changeImageBtn}>
                <Upload size={14} /> เปลี่ยนรูป
              </button>
            </div>
          )}
        </div>

        <div className={styles.gridTwo}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>ประเภท</label>
            <select className={styles.formSelect} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              <option value="elected">🗳️ การเลือกตั้ง</option>
              <option value="appointed">📜 การแต่งตั้ง</option>
            </select>
          </div>
          <div>
            <label className={styles.formLabel}>ลำดับ (Sorting)</label>
            <input type="number" className={styles.formInput} value={formData.order} onChange={(e) => { const val = e.target.value; setFormData({ ...formData, order: val === "" ? "" : parseInt(val), }); }} />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>ชื่อ-นามสกุล <span style={{ color: 'var(--color-danger)' }}>*</span></label>
          <input type="text" required className={styles.formInput} placeholder="เช่น ภก.สมชาย ใจดี" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>ตำแหน่ง <span style={{ color: 'var(--color-danger)' }}>*</span></label>
          <input type="text" required className={styles.formInput} placeholder="เช่น นายกสภา..." value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>ประวัติ / ภูมิหลัง</label>
          <textarea className={styles.formInput} placeholder="ระบุรายละเอียดประวัติ..." rows={4} style={{ resize: 'vertical', minHeight: '80px' }} value={formData.background} onChange={(e) => setFormData({ ...formData, background: e.target.value })} />
        </div>
      </CrudModal>

      {/* Image Preview Modal */}
      <ImagePreviewModal imageUrl={previewImage} onClose={() => setPreviewImage(null)} />

      {/* Bio Modal */}
      {viewingBio && (
        <div className={styles.modalOverlay} onClick={() => setViewingBio(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>ประวัติ: {viewingBio.name}</h3>
              <button onClick={() => setViewingBio(null)} className={styles.btnClose}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.bioContent}>{viewingBio.text}</div>
              <div className="flex justify-end pt-2">
                <button onClick={() => setViewingBio(null)} className={styles.btnCancel} style={{ flex: "none" }}>ปิดหน้าต่าง</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CROP MODAL */}
      {isCropping && imageToCrop && (
        <div className={styles.cropModalOverlay}>
          <div className={styles.cropModalContent}>
            <div className={styles.cropperContainer}>
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className={styles.cropControls}>
              <div className={styles.zoomSliderContainer}>
                <ZoomOut size={20} color="#9ca3af" />
                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className={styles.zoomSlider} />
                <ZoomIn size={20} color="#9ca3af" />
              </div>
              <div className={styles.cropActions}>
                <button onClick={() => { setIsCropping(false); setImageToCrop(null); }} className={styles.btnCropCancel}>
                  ยกเลิก
                </button>
                <button onClick={handleConfirmCrop} className={styles.btnCropConfirm}>
                  ครอปและบันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}