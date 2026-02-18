'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import styles from '../preview.module.css';

interface NewsItem {
    id: number;
    title: string;
    content: string;
    category: 'news' | 'announcement' | 'activity';
    status: 'published' | 'draft';
    createdAt: string;
    updatedAt: string;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/news`;

export default function NewsPreviewPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;

    const [news, setNews] = useState<NewsItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                if (!id) return;
                const res = await fetch(`${API_URL}/${id}`);
                if (!res.ok) throw new Error('Failed to fetch news data');
                const data = await res.json();
                setNews(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, [id]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getCategoryLabel = (cat: string) => {
        switch (cat) {
            case 'news': return 'ข่าวประชาสัมพันธ์';
            case 'announcement': return 'ประกาศ';
            case 'activity': return 'กิจกรรม';
            default: return cat;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className={styles.previewContainer}>
                <div className={styles.errorContainer}>
                    <h2 className="text-2xl font-bold mb-2">ไม่พบข้อมูลข่าว</h2>
                    <p className="text-gray-600 mb-4">{error || 'ไม่สามารถค้นหาข่าวที่คุณต้องการได้'}</p>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        <ArrowLeft size={20} /> กลับไปหน้าจัดการข่าว
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.previewContainer}>
            <div className={styles.articleWrapper}>
                <button onClick={() => router.back()} className={styles.backButton}>
                    <ArrowLeft size={20} /> ย้อนกลับ
                </button>

                <header className={styles.header}>
                    <div className={styles.meta}>
                        <span className={styles.categoryTag}>
                            {getCategoryLabel(news.category)}
                        </span>
                        <span className={styles.publishDate}>
                            <Calendar size={16} />
                            {formatDate(news.createdAt)}
                        </span>
                        {/* ถ้ามีผู้เขียนก็ใส่ได้ แต่ตอนนี้ API อาจยังไม่ส่งมา */}
                        <span className="flex items-center gap-1">
                            <User size={16} /> Admin
                        </span>
                    </div>
                    <h1 className={styles.title}>{news.title}</h1>
                </header>

                {/* Render HTML content safely */}
                <article
                    className={styles.content}
                    dangerouslySetInnerHTML={{ __html: news.content }}
                />

                {news.status === 'draft' && (
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-center">
                        นี่คือ "ฉบับร่าง" ยังไม่ได้เผยแพร่สู่สาธารณะ
                    </div>
                )}
            </div>
        </div>
    );
}
