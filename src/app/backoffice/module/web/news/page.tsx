'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './news.module.css';
import { Edit, Trash2, Search, Plus } from 'lucide-react';

// Types
type NewsStatus = 'published' | 'draft';
type NewsCategory = 'news' | 'announcement' | 'activity';

interface NewsItem {
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

interface SortConfig {
  key: 'createdAt' | 'updatedAt' | 'status' | 'order' | 'category';
  direction: 'asc' | 'desc';
}

type FilterStatus = 'all' | 'published' | 'draft';
type FilterCategory = 'all' | NewsCategory;

const API_URL = 'https://pharmacy-api-6w5d.onrender.com/news';

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'order', direction: 'desc' });

  // Fetch Data
  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setNewsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // --- Functions ---

  const deleteNews = async (id: number) => {
    if (confirm('ยืนยันการลบข่าวนี้?')) {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete');
        setNewsList(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
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
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // ฟังก์ชันแปลง datetime format
  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return { date: '', time: '' };
    // ถ้ารูป YYYY-MM-DD HH:mm:ss
    if (dateTimeStr.includes(' ')) {
      const [date, time] = dateTimeStr.split(' ');
      return { date, time };
    }
    // ถ้ารูป YYYY-MM-DDTHH:mm
    const dt = new Date(dateTimeStr);
    const date = dt.toISOString().split('T')[0];
    const time = dt.toTimeString().slice(0, 8);
    return { date, time };
  };

  // --- Process Data ---
  const processedNews = useMemo(() => {
    let result = [...newsList];
    if (searchQuery) result = result.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterStatus !== 'all') result = result.filter(item => item.status === filterStatus);
    if (filterCategory !== 'all') result = result.filter(item => item.category === filterCategory);

    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [newsList, searchQuery, filterStatus, filterCategory, sortConfig]);

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
            <Search
              style={{ position: 'absolute', left: '10px', color: '#9ca3af' }}
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหา..."
              className={styles.searchBox}
              style={{ paddingLeft: '35px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className={styles.filterSelect} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as FilterCategory)} aria-label="Filter by category">
            <option value="all">ทุกประเภท</option>
            <option value="news">ข่าว</option>
            <option value="announcement">ประกาศ</option>
            <option value="activity">กิจกรรม</option>
          </select>
          <select className={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)} aria-label="Filter by status">
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
              <th className={styles.thSortable} onClick={() => handleSort('order')} style={{ width: '80px', textAlign: 'center' }}>
                ลำดับ <span className={sortConfig.key === 'order' ? styles.sortIconActive : styles.sortIcon}>{getSortIcon('order')}</span>
              </th>
              <th>หัวข้อข่าว</th>
              <th style={{ width: '130px', textAlign: 'center' }}>ประเภท</th>
              <th className={styles.thSortable} onClick={() => handleSort('createdAt')} style={{ width: '140px' }}>
                วันที่สร้าง <span className={sortConfig.key === 'createdAt' ? styles.sortIconActive : styles.sortIcon}>{getSortIcon('createdAt')}</span>
              </th>
              <th className={styles.thSortable} onClick={() => handleSort('updatedAt')} style={{ width: '140px' }}>
                แก้ไขล่าสุด <span className={sortConfig.key === 'updatedAt' ? styles.sortIconActive : styles.sortIcon}>{getSortIcon('updatedAt')}</span>
              </th>
              <th style={{ width: '120px', textAlign: 'center' }}>สถานะ</th>
              <th style={{ width: '160px', textAlign: 'center' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>กำลังโหลดข้อมูล...</td></tr>
            ) : processedNews.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>ไม่พบข้อมูลตามเงื่อนไข</td></tr>
            ) : (
              processedNews.map((item) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#555' }}>{item.order}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.title}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={styles.badge}>
                      {item.category === 'news' && 'ข่าว'}
                      {item.category === 'announcement' && 'ประกาศ'}
                      {item.category === 'activity' && 'กิจกรรม'}
                    </span>
                  </td>
                  <td>
                    <div>{formatDateTime(item.createdAt).date}</div>
                    <div style={{ fontSize: '0.85rem', color: '#999' }}>{formatDateTime(item.createdAt).time}</div>
                  </td>
                  <td>
                    <div>{formatDateTime(item.updatedAt).date}</div>
                    <div style={{ fontSize: '0.85rem', color: '#999' }}>{formatDateTime(item.updatedAt).time}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`${styles.badge} ${item.status === 'published' ? styles.published : styles.draft}`}>
                      {item.status === 'published' ? 'เผยแพร่' : 'ฉบับร่าง'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <div className={styles.actionButtons}>
                      <Link href={`/backoffice/module/web/news/edit/${item.id}`} className={`${styles.btn} ${styles.btnEdit}`}>
                        <Edit size={18} />
                      </Link>
                      <button className={`${styles.btn} ${styles.btnDelete}`} onClick={() => deleteNews(item.id)}>
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
  );
}