"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge, Button, Input, Select } from "@/app/components/common/FormElements";
import { Modal } from "@/app/components/common/Modal";
import { Table, TableCell, TableRow } from "@/app/components/common/Table";
import { createNews, deleteNews, loadNews, updateNews, type NewsItem, type NewsStatus } from "./newsStorage";
import styles from "./news.module.css";

const STATUS_OPTIONS: { label: string; value: NewsStatus }[] = [
  { label: "ร่าง", value: "draft" },
  { label: "เผยแพร่", value: "published" },
];

function formatDateTime(iso?: string) {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function News() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formYear, setFormYear] = useState(String(new Date().getFullYear()));
  const [formOrder, setFormOrder] = useState("1");
  const [formStatus, setFormStatus] = useState<NewsStatus>("draft");
  const [errors, setErrors] = useState<{ title?: string; content?: string; year?: string; order?: string }>({});

  useEffect(() => {
    setItems(loadNews());
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormTitle("");
    setFormContent("");
    setFormYear(String(new Date().getFullYear()));
    setFormOrder("1");
    setFormStatus("draft");
    setErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormContent(item.content);
    setFormYear(String(item.year));
    setFormOrder(String(item.order));
    setFormStatus(item.status);
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!formTitle.trim()) next.title = "กรุณากรอกหัวข้อ";
    if (!formContent.trim()) next.content = "กรุณากรอกเนื้อหา";
    const y = Number(formYear);
    if (Number.isNaN(y) || y < 2000 || y > 2100) next.year = "กรุณากรอกปีที่ถูกต้อง (2000–2100)";
    const o = Number(formOrder);
    if (Number.isNaN(o) || o < 1) next.order = "กรุณากรอกลำดับเป็นตัวเลข (อย่างน้อย 1)";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const year = Number(formYear);
    const order = Number(formOrder);
    if (editingId) {
      updateNews(editingId, { title: formTitle.trim(), content: formContent.trim(), year, order, status: formStatus });
    } else {
      createNews({ title: formTitle.trim(), content: formContent.trim(), year, order, status: formStatus });
    }
    setItems(loadNews());
    closeModal();
  };

  const handleDelete = (item: NewsItem) => {
    if (!window.confirm(`ยืนยันลบข่าว "${item.title}" ?`)) return;
    deleteNews(item.id);
    setItems(loadNews());
  };

  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(items.map((it) => it.year)))
      .sort((a, b) => b - a)
      .map((y) => ({ label: y.toString(), value: y.toString() }));
    return [{ label: "ทุกปี", value: "all" }, ...years];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const year = yearFilter === "all" ? null : Number(yearFilter);

    return items
      .filter((it) => (q ? it.title.toLowerCase().includes(q) : true))
      .filter((it) => (year ? it.year === year : true))
      .sort((a, b) => {
        // year desc, then order asc
        if (a.year !== b.year) return b.year - a.year;
        if (a.order !== b.order) return a.order - b.order;
        // stable-ish fallback
        return (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt);
      });
  }, [items, query, yearFilter]);

  const headers = ["หัวข้อ", "ปี", "ลำดับ", "สถานะ", "อัปเดตล่าสุด", "จัดการ"];

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>ข่าวประชาสัมพันธ์</h1>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <div className={styles.searchIcon}>
              <Search size={18} />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาหัวข้อข่าว"
              className={styles.searchInput}
            />
          </div>

          <div className={styles.yearSelectWrap}>
            <Select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              options={yearOptions}
            />
          </div>

          <Button variant="primary" onClick={openCreate}>
            เพิ่มข่าว
          </Button>
        </div>
      </div>

      <Table headers={headers} isLoading={false}>
        {filtered.length === 0 ? (
          <TableRow>
            <TableCell colSpan={headers.length} className={styles.emptyCell}>
              ไม่พบรายการข่าว
            </TableCell>
          </TableRow>
        ) : (
          filtered.map((it) => (
            <TableRow key={it.id}>
              <TableCell className={styles.cellTitle}>{it.title}</TableCell>
              <TableCell className={styles.cellMuted}>{it.year}</TableCell>
              <TableCell className={styles.cellMuted}>{it.order}</TableCell>
              <TableCell>
                <Badge color={it.status === "published" ? "green" : "gray"}>
                  {it.status === "published" ? "เผยแพร่" : "ร่าง"}
                </Badge>
              </TableCell>
              <TableCell className={styles.cellSecondary}>
                {formatDateTime(it.updatedAt ?? it.createdAt)}
              </TableCell>
              <TableCell>
                <div className={styles.actions}>
                  <Button variant="secondary" onClick={() => openEdit(it)}>
                    แก้ไข
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(it)}>
                    ลบ
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? "แก้ไขข่าว" : "เพิ่มข่าว"}
      >
        <div className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formFull}>
              <Input
                label="หัวข้อ"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="เช่น ประกาศเปิดรับสมัคร"
              />
              {errors.title && <p className={styles.error}>{errors.title}</p>}
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formFull}>
              <label className={styles.label}>เนื้อหา</label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="รายละเอียดข่าว"
                rows={4}
                className={styles.textarea}
              />
              {errors.content && <p className={styles.error}>{errors.content}</p>}
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formHalf}>
              <Input
                label="ปีที่ประกาศ"
                type="number"
                min={2000}
                max={2100}
                value={formYear}
                onChange={(e) => setFormYear(e.target.value)}
              />
              {errors.year && <p className={styles.error}>{errors.year}</p>}
            </div>
            <div className={styles.formHalf}>
              <Input
                label="ลำดับประกาศ"
                type="number"
                min={1}
                value={formOrder}
                onChange={(e) => setFormOrder(e.target.value)}
              />
              {errors.order && <p className={styles.error}>{errors.order}</p>}
            </div>
          </div>
          <div className={styles.formRow}>
            <Select
              label="สถานะ"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as NewsStatus)}
              options={STATUS_OPTIONS}
            />
          </div>
          <div className={styles.formActions}>
            <Button variant="secondary" onClick={closeModal}>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? "บันทึกการแก้ไข" : "เพิ่มข่าว"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}