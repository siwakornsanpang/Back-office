'use client';

import React, { useState } from 'react';
import styles from './news.module.css';
import Editor from '@/app/components/editor/editor';
import { useRouter } from 'next/navigation';

// Types
export type NewsStatus = 'published' | 'draft';
export type NewsCategory = 'news' | 'announcement' | 'activity';

export interface NewsItem {
    id: number;
    order: number;
    title: string;
    content: string;
    year: number;
    category: NewsCategory;
    status: NewsStatus;
    createdAt: string;
    updatedAt: string;
}

interface NewsFormProps {
    initialData?: NewsItem;
    mode: 'create' | 'edit';
}

const API_URL = 'https://pharmacy-api-6w5d.onrender.com/news';

export default function NewsForm({ initialData, mode }: NewsFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [category, setCategory] = useState<NewsCategory>(initialData?.category || 'news');
    const [status, setStatus] = useState<NewsStatus>(initialData?.status || 'draft');
    const [order, setOrder] = useState<number>(initialData?.order || 0);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || order <= 0) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        setIsSubmitting(true);
        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toTimeString().slice(0, 8);
        const todayDateTime = `${today} ${currentTime}`;

        try {
            if (mode === 'edit' && initialData) {
                const updatedItem = {
                    ...initialData,
                    title,
                    content,
                    category,
                    status,
                    order,
                    updatedAt: todayDateTime
                };

                const res = await fetch(`${API_URL}/${initialData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedItem),
                });

                if (!res.ok) throw new Error('Failed to update');
            } else {
                const currentYear = new Date().getFullYear();
                const newItem = {
                    id: Date.now(),
                    order,
                    title,
                    content,
                    year: currentYear,
                    category,
                    status,
                    createdAt: todayDateTime,
                    updatedAt: todayDateTime,
                };

                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newItem),
                });

                if (!res.ok) throw new Error('Failed to create');
            }

            router.push('/backoffice/module/web/news');
            router.refresh();
        } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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
                        ข่าวประชาสัมพันธ์ / <span className="text-blue-600 font-medium">{mode === 'create' ? 'เพิ่มข่าว' : 'แก้ไขข่าว'}</span>
                    </p>
                </div>
            </header>

            <div className={styles.tableContainer} style={{ padding: '2rem', marginTop: '0' }}>
                <form onSubmit={handleSave}>
                    <div className={styles.formRow}>
                        <div className={styles.formCol} style={{ flex: '0 0 auto', width: '100px' }}>
                            <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>ลำดับที่</label>
                            <input
                                type="number"
                                className={styles.input}
                                min="1"
                                value={order || ''}
                                onChange={e => setOrder(parseInt(e.target.value) || 0)}
                                required
                            />
                        </div>

                        <div className={styles.formCol}>
                            <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>หัวข้อ</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder='กรุณาระบุหัวข้อข่าว...'
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formCol}>
                            <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>ประเภท</label>
                            <select
                                className={styles.modalSelect}
                                value={category}
                                onChange={e => setCategory(e.target.value as NewsCategory)}
                            >
                                <option value="news">ข่าว</option>
                                <option value="announcement">ประกาศ</option>
                                <option value="activity">กิจกรรม</option>
                            </select>
                        </div>

                        <div className={styles.formCol}>
                            <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>สถานะ</label>
                            <select
                                className={styles.modalSelect}
                                value={status}
                                onChange={e => setStatus(e.target.value as NewsStatus)}
                            >
                                <option value="draft">ฉบับร่าง</option>
                                <option value="published">เผยแพร่</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <Editor
                            label="เนื้อหาข่าว"
                            value={content}
                            onChange={setContent}
                            placeholder="กรุณาระบุรายละเอียดข่าว..."
                        />
                    </div>

                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnCancel}`}
                            onClick={() => router.back()}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className={`${styles.btn} ${styles.btnSave}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}