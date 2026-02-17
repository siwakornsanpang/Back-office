'use client';

import React, { useState } from 'react';
import styles from './news.module.css';
import Editor from '@/app/components/editor/editor'; // หรือ path ที่ถูกต้อง
import { useRouter } from 'next/navigation';
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
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{mode === 'create' ? 'เพิ่มข่าวใหม่' : 'แก้ไขข่าว'}</h1>
                    <p className={styles.breadcrumb}>
                        ข่าวประชาสัมพันธ์ / <span className="text-blue-600 font-medium">{mode === 'create' ? 'เพิ่มข่าวใหม่' : 'แก้ไขข่าว'}</span>
                    </p>
                </div>
            </header>

            <div className={styles.tableContainer} style={{ padding: '2rem' }}>
                <form onSubmit={handleSave}>
                    {/* --- ส่วน Input ทั่วไป --- */}
                    <div className={styles.formRow}>
                        <div className={styles.formCol} style={{ flex: '0 0 auto', width: '100px' }}>
                            <label>ลำดับที่</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={order}
                                onChange={e => setOrder(e.target.value)}
                            />
                        </div>
                        <div className={styles.formCol}>
                            <label>หัวข้อ</label>
                            <input type="text" className={styles.input} value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formCol}>
                            <label>ประเภท</label>
                            <select className={styles.modalSelect} value={category} onChange={e => setCategory(e.target.value as any)}>
                                <option value="news">ข่าว</option>
                                <option value="announcement">ประกาศ</option>
                                <option value="activity">กิจกรรม</option>
                            </select>
                        </div>
                        <div className={styles.formCol}>
                            <label>สถานะ</label>
                            <select className={styles.modalSelect} value={status} onChange={e => setStatus(e.target.value as any)}>
                                <option value="draft">ฉบับร่าง</option>
                                <option value="published">เผยแพร่</option>
                            </select>
                        </div>
                    </div>

                    {/* --- Editor --- */}
                    <div className={styles.formGroup} style={{ marginTop: '20px' }}>
                        <Editor
                            label="เนื้อหาข่าว"
                            value={content}
                            onChange={setContent}
                            placeholder="พิมพ์เนื้อหาข่าว หรือกดปุ่มรูปภาพเพื่ออัปโหลด..."
                        />
                    </div>

                    {/* ❌ ลบส่วน Upload Gallery เดิมออกทั้งหมดตรงนี้ ❌ */}

                    <div className={styles.modalActions} style={{ marginTop: '20px' }}>
                        <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={() => router.back()}>ยกเลิก</button>
                        <button type="submit" className={`${styles.btn} ${styles.btnSave}`} disabled={isSubmitting}>
                            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}