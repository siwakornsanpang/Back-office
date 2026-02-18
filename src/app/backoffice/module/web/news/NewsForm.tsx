'use client';

import React, { useState } from 'react';
import styles from './news.module.css';
import Editor from '@/app/components/editor/editor'; // หรือ path ที่ถูกต้อง
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Save, X } from 'lucide-react';
import Swal from 'sweetalert2';

// Types
export type NewsStatus = 'published' | 'draft';
export type NewsCategory = 'news' | 'announcement' | 'activity';

export interface NewsItem {
    id: number;
    order: number;
    title: string;
    content: string;
    category: NewsCategory;
    status: NewsStatus;
    publishedAt?: string;
    // images field ไม่ต้องใช้ใน Form แล้ว เพราะอยู่ใน content
}

interface NewsFormProps {
    initialData?: NewsItem;
    mode: 'create' | 'edit';
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/news`;

export default function NewsForm({ initialData, mode }: NewsFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State เหลือแค่นี้
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [category, setCategory] = useState<NewsCategory>(initialData?.category || 'news');
    const [status, setStatus] = useState<NewsStatus>(initialData?.status || 'draft');
    const [publishedAt, setPublishedAt] = useState(() => {
        if (initialData?.publishedAt) {
            const d = new Date(initialData.publishedAt);
            // Adjust to local ISO string for input[type="datetime-local"]
            const offset = d.getTimezoneOffset() * 60000;
            return new Date(d.getTime() - offset).toISOString().slice(0, 16);
        }
        return '';
    });
    const [order, setOrder] = useState<number | string>(initialData?.order || 0);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (!title.trim() || !content.trim()) {
            Swal.fire('แจ้งเตือน', 'กรุณาระบุหัวข้อและเนื้อหาข่าว', 'warning');
            return;
        }

        setIsSubmitting(true);

        try {
            // ✅ เปลี่ยนกลับมาส่ง JSON ปกติ (เพราะรูปเป็น URL ใน content แล้ว)
            const payload = {
                title,
                content,
                category,
                status,
                publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null, // ส่งเป็น ISO String หรือ null
                order: Number(order)
            };

            let url = API_URL;
            let method = 'POST';

            if (mode === 'edit' && initialData) {
                url = `${API_URL}/${initialData.id}`;
                method = 'PUT';
            }

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json', // ✅ สำคัญ: ต้องระบุว่าเป็น JSON
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to save');
            }

            await Swal.fire({
                icon: 'success',
                title: 'บันทึกสำเร็จ',
                showConfirmButton: false,
                timer: 1500
            });

            router.push('/backoffice/module/web/news');
            router.refresh();

        } catch (err: any) {
            console.error(err);
            Swal.fire('Error', err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSave} className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{mode === 'create' ? 'เพิ่มข่าวใหม่' : 'แก้ไขข่าว'}</h1>
                    <p className={styles.breadcrumb}>
                        ข่าวประชาสัมพันธ์ / <span className="text-blue-600 font-medium">{mode === 'create' ? 'เพิ่มข่าวใหม่' : 'แก้ไขข่าว'}</span>
                    </p>
                </div>

                <div className={styles.headerActions}>
                    {mode === 'edit' && initialData && (
                        <Link
                            href={`/backoffice/module/web/news/preview/${initialData.id}`}
                            className={styles.btnPreview}
                            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', border: '1px solid #d1d5db' }}
                            target="_blank"
                        >
                            <Eye size={18} /> ดูตัวอย่าง
                        </Link>
                    )}
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnCancel}`}
                        onClick={() => router.back()}
                    >
                        <X size={18} /> ยกเลิก
                    </button>
                    <button
                        type="submit"
                        className={`${styles.btn} ${styles.btnSave}`}
                        disabled={isSubmitting}
                    >
                        <Save size={18} /> {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                </div>
            </header>

            <div className={styles.layoutGrid}>
                {/* Main Content Column */}
                <div className={styles.mainColumn}>
                    {/* Title Input */}
                    <div className={styles.card}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>หัวข้อข่าว</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Editor */}
                    <div className={styles.card} style={{ minHeight: '500px' }}>
                        <Editor
                            label="เนื้อหาข่าว"
                            value={content}
                            onChange={setContent}
                            placeholder="พิมพ์เนื้อหาข่าว หรือกดปุ่มรูปภาพเพื่ออัปโหลด..."
                        />
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className={styles.sidebarColumn}>

                    {/* Publishing Card */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>การเผยแพร่</h3>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>สถานะ</label>
                            <select
                                className={styles.modalSelect}
                                value={status}
                                onChange={e => setStatus(e.target.value as any)}
                            >
                                <option value="draft">ฉบับร่าง</option>
                                <option value="published">เผยแพร่</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>วันที่เผยแพร่</label>
                            <input
                                type="datetime-local"
                                className={styles.input}
                                value={publishedAt}
                                onChange={e => setPublishedAt(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Categorization Card */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>การจัดหมวดหมู่</h3>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>ประเภท</label>
                            <div className={styles.radioGroup}>
                                <label className={styles.radioItem}>
                                    <input
                                        type="radio"
                                        name="category"
                                        value="news"
                                        checked={category === 'news'}
                                        onChange={e => setCategory(e.target.value as any)}
                                    />
                                    ข่าว
                                </label>
                                <label className={styles.radioItem}>
                                    <input
                                        type="radio"
                                        name="category"
                                        value="announcement"
                                        checked={category === 'announcement'}
                                        onChange={e => setCategory(e.target.value as any)}
                                    />
                                    ประกาศ
                                </label>
                                <label className={styles.radioItem}>
                                    <input
                                        type="radio"
                                        name="category"
                                        value="activity"
                                        checked={category === 'activity'}
                                        onChange={e => setCategory(e.target.value as any)}
                                    />
                                    กิจกรรม
                                </label>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>ลำดับที่</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={order}
                                onChange={e => setOrder(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}