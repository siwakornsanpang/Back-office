"use client";
import { Edit, Trash2 } from "lucide-react";

import { FormEvent, useEffect, useRef, useState } from "react";
import { authFetch } from "@/app/utils/authFetch";
import styles from "../academy.module.css";
import formStyles from "../academyForms.module.css";
import AcademyImageField from "../AcademyImageField";
import AcademyColorField from "../AcademyColorField";
import AcademyVisibilityField from "../AcademyVisibilityField";
import AcademyImagePreview from "../AcademyImagePreview";
import { academySuccess, academyError, academyConfirmDelete } from "../academyFeedback";
import AcademyEmptyState from "../AcademyEmptyState";
import AcademyPagination from "../AcademyPagination";
import AcademyModal from "../AcademyModal";
import { moveAcademyItem } from "../AcademyReorderButtons";
import { AcademySortableList, AcademySortableItem, AcademySortInstructions } from "../AcademySortable";

import AcademyForm, { AcademyField } from "../AcademyForm";
import useAcademyUnsavedChanges from "../useAcademyUnsavedChanges";
import useAcademyOrderAnchor from "../useAcademyOrderAnchor";

const API = process.env.NEXT_PUBLIC_API_URL;

type Category = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  color: string | null;
  sortOrder: number;
  isVisible: boolean;
};

const empty = {
  name: "",
  description: "",
  imageUrl: "",
  color: "#737300",
  sortOrder: 0,
  isVisible: true,
};

export default function AcademyCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [initialForm, setInitialForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const preserveOrderPosition = useAcademyOrderAnchor(items);
  const originalOrder = useRef<typeof items>([]);
  const [page, setPage] = useState(1);
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const formDirty = formOpen && (Boolean(file) || JSON.stringify(form) !== JSON.stringify(initialForm));
  const confirmDiscard = useAcademyUnsavedChanges(formDirty || orderDirty, saving);
  const closeForm = async () => { if (await confirmDiscard()) reset(); };


  const [listState, setListState] = useState<"loading" | "ready" | "error">("loading");

  const load = async () => {
    setListState("loading");
    try {
      const res = await authFetch(`${API}/academy/admin/categories`);
      if (!res.ok) throw new Error();
      setItems((await res.json()).sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder));
      setOrderDirty(false);
      setListState("ready");
    } catch { setListState("error"); }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(empty);
    setEditingId(null);
    setFile(null);
    setFormOpen(false);
  };

  const startAdd = () => {
    setForm(empty);
    setInitialForm(empty);
    setEditingId(null);
    setFile(null);
    setFormOpen(true);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
    let imageUrl = form.imageUrl || null;
    if (file) {
      const body = new FormData();
      body.append("file", file);
      const uploaded = await authFetch(`${API}/academy/admin/upload`, { method: "POST", body });
      const data = await uploaded.json();
      if (!uploaded.ok) {
        await academyError("อัปโหลดไม่สำเร็จ", data.message || "กรุณาลองอีกครั้ง");
        return;
      }
      imageUrl = data.url;
    }
    const payload = { ...form, imageUrl, sortOrder: Number(form.sortOrder) };
    const res = await authFetch(
      editingId ? `${API}/academy/admin/categories/${editingId}` : `${API}/academy/admin/categories`,
      { method: editingId ? "PUT" : "POST", body: JSON.stringify(payload) }
    );
    if (!res.ok) {
      const data = await res.json();
      await academyError("บันทึกไม่สำเร็จ", data.message || "กรุณาลองอีกครั้ง");
      return;
    }
    reset();
    await load();
    await academySuccess("บันทึกหมวดหมู่สำเร็จ");
    } catch { await academyError("บันทึกไม่สำเร็จ", "กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง"); }
    finally { savingRef.current = false; setSaving(false); }
  };

  const remove = async (item: Category) => {
    const confirmed = await academyConfirmDelete(`ลบ ${item.name}?`);
    if (!confirmed.isConfirmed) return;
    try {
    const res = await authFetch(`${API}/academy/admin/categories/${item.id}`, { method: "DELETE" });
    if (!res.ok) { await academyError("ลบไม่สำเร็จ"); return; }
    await load();
    await academySuccess("ลบหมวดหมู่สำเร็จ");
    } catch { await academyError("ลบไม่สำเร็จ"); }
  };

  const cancelOrdering = async () => {
    if (!await confirmDiscard()) return;
    preserveOrderPosition([]);
    setItems(originalOrder.current);
    setOrderDirty(false);
  };

  const moveItem = (from: number, to: number) => {
    if (savingRef.current) return;
    if (from === to || from < 0 || to < 0) return;
    if (!orderDirty) { originalOrder.current = [...items]; preserveOrderPosition([items[from].id, items[to].id]); }
    setItems((current) => moveAcademyItem(current, from, to));
    setOrderDirty(true);
  };

  const saveOrder = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    preserveOrderPosition([]);
    setSaving(true);
    try {
      for (const [index, item] of items.entries()) {
        if (item.sortOrder === index) continue;
        const res = await authFetch(`${API}/academy/admin/categories/${item.id}`, { method: "PUT", body: JSON.stringify({ ...item, sortOrder: index }) });
        if (!res.ok) throw new Error();
      }
      await load();
      await academySuccess("บันทึกลำดับสำเร็จ");
    } catch {
      await load();
      await academyError("บันทึกลำดับไม่สำเร็จ", "โหลดลำดับล่าสุดแล้ว กรุณาลองอีกครั้ง");
    } finally { savingRef.current = false; setSaving(false); }
  };

  const pageCount = Math.max(1, Math.ceil(items.length / 20));
  const currentPage = Math.min(page, pageCount);
  const visibleItems = orderDirty ? items : items.slice((currentPage - 1) * 20, currentPage * 20);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>หมวดหมู่</h1>
          <p className={styles.subtitle}>แสดงบนส่วนหมวดหมู่ยอดนิยมของหน้า Academy</p>
        </div>
        <button className={styles.primary} type="button" disabled={saving || orderDirty} onClick={startAdd}>เพิ่มหมวดหมู่</button>
      </div>

      <AcademyModal open={formOpen} title={editingId ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"} titleId="academy-category-modal-title" saving={saving} onClose={closeForm}>
          <AcademyForm className={`${styles.form} ${styles.modalForm} ${formStyles.form}`} onSubmit={onSubmit} aria-busy={saving}>
        <fieldset disabled={saving}><p className={styles.formHint}>ช่องที่มี * จำเป็นต้องกรอก</p>
                <AcademyField label="ชื่อหมวดหมู่"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></AcademyField>
        <AcademyField label="คำอธิบาย"><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></AcademyField>
        <div className={formStyles.appearanceGrid}>
        <AcademyImageField label="รูปหมวดหมู่" src={form.imageUrl} file={file} onFileChange={setFile} onRemove={() => { setFile(null); setForm({ ...form, imageUrl: "" }); }} disabled={saving} />
          <div className={formStyles.fields}>
        <AcademyColorField value={form.color} onChange={(color) => setForm({ ...form, color })} disabled={saving} />
        <AcademyVisibilityField checked={form.isVisible} onChange={(isVisible) => setForm({ ...form, isVisible })} disabled={saving} />
            <p className={styles.formHint}>จัดลำดับโดยลากรายการในหน้ารายการหลังบันทึก</p>
          </div>
        </div>
<div className={styles.actions}>
          <button className={styles.primary} type="submit" disabled={saving}>{saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "บันทึก"}</button>
          <button className={styles.ghost} type="button" onClick={closeForm}>ยกเลิก</button>
        </div>
          </fieldset>
      </AcademyForm>
      </AcademyModal>

      {orderDirty && <div className={styles.actions} role="status">
        <span>มีการเปลี่ยนลำดับที่ยังไม่ได้บันทึก · แสดงทุกรายการให้ลากข้ามหน้าได้</span>
        <button className={styles.primary} type="button" disabled={saving} onClick={saveOrder}>{saving ? "กำลังบันทึก..." : "บันทึกลำดับ"}</button>
        <button className={styles.ghost} type="button" disabled={saving} onClick={cancelOrdering}>ยกเลิกการเรียง</button>
      </div>}
      {listState === "ready" && items.length > 1 && <AcademySortInstructions />}
      <AcademySortableList ids={items.map((item) => item.id)} disabled={saving} onReorder={(activeId, overId) => moveItem(items.findIndex((item) => item.id === activeId), items.findIndex((item) => item.id === overId))}>
      <div className={styles.tableScroll} style={{ marginTop: "1.25rem" }}><table className={styles.table}>
        <thead>
          <tr><th className={styles.dragColumn} aria-label="จัดลำดับ"></th><th className={styles.center}>รูป</th><th>ชื่อ</th><th className={styles.center}>ลำดับ</th><th className={styles.center}>แสดง</th><th className={styles.actionColumn}>จัดการ</th></tr>
        </thead>
        <tbody>
          {(items.length === 0 || listState !== "ready") && <tr><td colSpan={6} className={styles.empty}><AcademyEmptyState action={listState === "error" ? <button className={styles.ghost} type="button" onClick={load}>ลองอีกครั้ง</button> : undefined} state={listState} title={listState === "loading" ? "กำลังโหลดหมวดหมู่" : listState === "error" ? "โหลดหมวดหมู่ไม่สำเร็จ" : "ยังไม่มีหมวดหมู่"} hint={listState === "loading" ? "กรุณารอสักครู่" : listState === "error" ? "กรุณาลองเปิดหน้านี้อีกครั้ง" : "กดเพิ่มหมวดหมู่เพื่อจัดกลุ่มคอร์สเรียน"} /></td></tr>}
          {listState === "ready" && visibleItems.map((item, index) => (
            <AcademySortableItem key={item.id} id={item.id} label={item.name} disabled={saving}>{({ setNodeRef, style, handle }) => (
            <tr data-academy-order-row={item.id} ref={setNodeRef} style={style}>
              <td className={styles.dragColumn}>{handle}</td>
              <td className={styles.imageColumn}><AcademyImagePreview src={item.imageUrl} alt={`รูปหมวดหมู่ ${item.name}`} /></td>
              <td>{item.name}</td>
              <td className={styles.center}>{(orderDirty ? 0 : (currentPage - 1) * 20) + index + 1}</td>
              <td className={styles.center}><span className={`${styles.badge} ${item.isVisible ? styles.badgeSuccess : styles.badgeNeutral}`}>{item.isVisible ? "แสดง" : "ซ่อน"}</span></td>
              <td className={`${styles.actions} ${styles.actionColumn}`}>
                <button className={styles.iconEdit} aria-label="แก้ไข" title="แก้ไข" type="button" disabled={saving || orderDirty} onClick={() => { setEditingId(item.id); setFile(null); setFormOpen(true); setInitialForm({ name: item.name, description: item.description || "", imageUrl: item.imageUrl || "", color: item.color || "#737300", sortOrder: item.sortOrder, isVisible: item.isVisible }); setForm({ name: item.name, description: item.description || "", imageUrl: item.imageUrl || "", color: item.color || "#737300", sortOrder: item.sortOrder, isVisible: item.isVisible }); }}><Edit size={16} aria-hidden="true" /></button>
                <button className={styles.iconDelete} aria-label="ลบ" title="ลบ" type="button" disabled={saving || orderDirty} onClick={() => remove(item)}><Trash2 size={16} aria-hidden="true" /></button>
              </td>
            </tr>
            )}</AcademySortableItem>
          ))}
        </tbody>
      </table></div>
      </AcademySortableList>
      {listState === "ready" && !orderDirty && <AcademyPagination page={currentPage} pageSize={20} total={items.length} onPageChange={setPage} itemLabel="หมวดหมู่" />}
    </div>
  );
}
