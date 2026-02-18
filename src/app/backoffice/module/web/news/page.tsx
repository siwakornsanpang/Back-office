'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './news.module.css';
import { Edit, Trash2, Search, Plus, ArrowUpDown, ArrowUp, ArrowDown, Eye } from 'lucide-react'; // เพิ่ม Icon
import Swal from 'sweetalert2';

// --- Types & Interfaces ---
type NewsStatus = 'published' | 'draft';
type NewsCategory = 'news' | 'announcement' | 'activity';

interface NewsItem {
  id: number;
  order: number;
  title: string;
  content: string; // HTML Content
  // year: number; // เอาออกถ้าไม่ได้ใช้ หรือใส่กลับถ้ามีใน DB
  category: NewsCategory;
  status: NewsStatus;
  publishedAt?: string; // Updated to publishedAt
  createdAt: string;
  updatedAt: string;
}

interface SortConfig {
  key: keyof NewsItem; // บังคับให้ key ตรงกับ field ใน NewsItem
  direction: 'asc' | 'desc';
}

type FilterStatus = 'all' | 'published' | 'draft';
type FilterCategory = 'all' | NewsCategory;

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/news`;

export default function NewsPage() {
  // --- States ---
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date()); // State for real-time updates

  // Timer for real-time status updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  // Helper function to check effective status
  const getEffectiveStatus = useCallback((item: NewsItem): NewsStatus => {
    if (item.publishedAt) {
      const publishDate = new Date(item.publishedAt);
      if (publishDate <= currentTime) {
        return 'published';
      }
    }
    return item.status;
  }, [currentTime]);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'order', direction: 'desc' });

  // --- Fetch Data ---
  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      // ตรวจสอบว่า data เป็น array จริงไหม
      setNewsList(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลข่าวได้',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // --- Actions ---
  const deleteNews = async (id: number) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');

        setNewsList(prev => prev.filter(item => item.id !== id));

        Swal.fire('ลบสำเร็จ!', 'ข้อมูลข่าวถูกลบเรียบร้อยแล้ว', 'success');
      } catch (err) {
        console.error(err);
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
      }
    }
  };

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortIcon = (key: SortConfig['key']) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return { date: '-', time: '-' };
    const dt = new Date(dateTimeStr);
    if (isNaN(dt.getTime())) return { date: '-', time: '-' }; // กัน error

    const date = dt.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    const time = dt.toLocaleTimeString('th-TH');
    return { date, time };
  };

  // --- Process Data ---
  const processedNews = useMemo(() => {
    let result = [...newsList];

    // Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => item.title.toLowerCase().includes(lowerQuery));
    }

    // Filter
    if (filterStatus !== 'all') {
      result = result.filter(item => getEffectiveStatus(item) === filterStatus);
    }
    if (filterCategory !== 'all') result = result.filter(item => item.category === filterCategory);

    // Sort
    result.sort((a, b) => {
      // Handle null/undefined values safely
      const aValue = a[sortConfig.key] ?? '';
      const bValue = b[sortConfig.key] ?? '';

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [newsList, searchQuery, filterStatus, filterCategory, sortConfig, getEffectiveStatus]); // Added getEffectiveStatus dependency

  // --- Render ---
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>จัดการข่าวประชาสัมพันธ์</h1>
          <p className={styles.breadcrumb}>
            <span className="text-blue-600 font-medium">ข่าวประชาสัมพันธ์</span>
          </p>
        </div>

        <div className={styles.controls}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} size={18} />
            <input
              type="text"
              placeholder="ค้นหา..."
              className={styles.searchBox}
              style={{ paddingLeft: '35px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select className={styles.filterSelect} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}>
            <option value="all">ทุกประเภท</option>
            <option value="news">ข่าว</option>
            <option value="announcement">ประกาศ</option>
            <option value="activity">กิจกรรม</option>
          </select>

          <select className={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}>
            <option value="all">สถานะทั้งหมด</option>
            <option value="published">เผยแพร่</option>
            <option value="draft">ฉบับร่าง</option>
          </select>

          <Link href="/backoffice/module/web/news/create" className={`${styles.btn} ${styles.btnAdd}`}>
            <Plus size={18} /> เพิ่มข่าว
          </Link>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thSortable} onClick={() => handleSort('order')} style={{ width: '80px', textAlign: 'center', cursor: 'pointer' }}>
                <div className="flex items-center justify-center gap-1">ลำดับ {getSortIcon('order')}</div>
              </th>
              <th>หัวข้อข่าว</th>
              <th style={{ width: '130px', textAlign: 'center' }}>ประเภท</th>
              <th className={styles.thSortable} onClick={() => handleSort('createdAt')} style={{ width: '140px', cursor: 'pointer' }}>
                <div className="flex items-center gap-1">วันที่สร้าง {getSortIcon('createdAt')}</div>
              </th>
              <th className={styles.thSortable} onClick={() => handleSort('updatedAt')} style={{ width: '140px', cursor: 'pointer' }}>
                <div className="flex items-center gap-1">แก้ไขล่าสุด {getSortIcon('updatedAt')}</div>
              </th>
              <th style={{ width: '120px', textAlign: 'center' }}>สถานะ</th>
              <th style={{ width: '120px', textAlign: 'center' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-500">กำลังโหลดข้อมูล...</td></tr>
            ) : processedNews.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">ไม่พบข้อมูลตามเงื่อนไข</td></tr>
            ) : (
              processedNews.map((item) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#555' }}>{item.order}</td>
                  <td><div style={{ fontWeight: 550 }}>{item.title}</div></td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={styles.badge} data-category={item.category}>
                      {item.category === 'news' && 'ข่าว'}
                      {item.category === 'announcement' && 'ประกาศ'}
                      {item.category === 'activity' && 'กิจกรรม'}
                    </span>
                  </td>
                  <td>
                    <div>{formatDateTime(item.createdAt).date}</div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>{formatDateTime(item.createdAt).time}</div>
                  </td>
                  <td>
                    <div>{formatDateTime(item.updatedAt).date}</div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>{formatDateTime(item.updatedAt).time}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`${styles.badge} ${getEffectiveStatus(item) === 'published' ? styles.published : styles.draft}`}>
                      {getEffectiveStatus(item) === 'published' ? 'เผยแพร่' : 'ฉบับร่าง'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className={styles.actionButtons}>
                      <Link href={`/backoffice/module/web/news/preview/${item.id}`} className={`${styles.btn} ${styles.btnEdit}`} title="ดูตัวอย่าง">
                        <Eye size={16} />
                      </Link>
                      <Link href={`/backoffice/module/web/news/edit/${item.id}`} className={`${styles.btn} ${styles.btnEdit}`}>
                        <Edit size={16} />
                      </Link>
                      <button className={`${styles.btn} ${styles.btnDelete}`} onClick={() => deleteNews(item.id)}>
                        <Trash2 size={16} />
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
  );
}