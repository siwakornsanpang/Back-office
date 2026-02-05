'use client';

import React, { useState, useMemo } from 'react';
import styles from './news.module.css';

// 1. Types
type NewsStatus = 'published' | 'draft';
type NewsCategory = 'news' | 'announcement' | 'activity'; // [NEW] ประเภทข่าว

interface NewsItem {
  id: number;
  order: number;
  title: string;
  content: string;
  year: number;
  category: NewsCategory; // [NEW]
  status: NewsStatus;
  createdAt: string;
  updatedAt: string;
}

interface SortConfig {
  key: 'createdAt' | 'updatedAt' | 'status' | 'order' | 'category';
  direction: 'asc' | 'desc';
}

type FilterStatus = 'all' | 'published' | 'draft';
type FilterCategory = 'all' | NewsCategory; // [NEW] Filter type

// 2. Mock Data
const MOCK_NEWS: NewsItem[] = [
  {
    id: 1,
    order: 1,
    title: 'สรุปผลประกอบการปี 2023',
    content: 'ผลประกอบการเป็นไปตามเป้าหมาย...',
    year: 2023,
    category: 'news',
    status: 'published',
    createdAt: '2023-12-20',
    updatedAt: '2023-12-25',
  },
  {
    id: 2,
    order: 2,
    title: 'เปิดตัวระบบ Backoffice ใหม่',
    content: 'ระบบใหม่ช่วยให้การจัดการข่าวง่ายขึ้น...',
    year: 2024,
    category: 'announcement',
    status: 'published',
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15',
  },
  {
    id: 3,
    order: 3,
    title: 'กิจกรรมงานวันเด็ก',
    content: 'ขอเชิญร่วมงานวันเด็กแห่งชาติ...',
    year: 2024,
    category: 'activity',
    status: 'draft',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-02',
  }
];

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>(MOCK_NEWS);

  // Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all'); // [NEW]

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'order',
    direction: 'desc'
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<NewsCategory>('news'); // [NEW]

  // --- Functions ---

  const toggleStatus = (id: number) => {
    const today = new Date().toISOString().split('T')[0];
    setNewsList(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'published' ? 'draft' : 'published';
        return { ...item, status: nextStatus, updatedAt: today };
      }
      return item;
    }));
  };

  // [NEW] ฟังก์ชันเปลี่ยน Category จากในตาราง
  const changeCategory = (id: number, newCat: NewsCategory) => {
    const today = new Date().toISOString().split('T')[0];
    setNewsList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, category: newCat, updatedAt: today };
      }
      return item;
    }));
  };

  const deleteNews = (id: number) => {
    if (confirm('ยืนยันการลบข่าวนี้?')) {
      setNewsList(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const currentYear = new Date().getFullYear();
    const today = new Date().toISOString().split('T')[0];
    const maxOrder = newsList.length > 0 ? Math.max(...newsList.map(n => n.order)) : 0;

    const newItem: NewsItem = {
      id: Date.now(),
      order: maxOrder + 1,
      title: newTitle,
      content: newContent,
      year: currentYear,
      category: newCategory, // [NEW]
      status: 'draft',
      createdAt: today,
      updatedAt: today,
    };

    setNewsList([...newsList, newItem]);
    // Reset form
    setNewTitle(''); setNewContent(''); setNewCategory('news');
    setIsModalOpen(false);
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

  // --- Process Data ---
  const processedNews = useMemo(() => {
    let result = [...newsList];

    // 1. Search
    if (searchQuery) {
      result = result.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // 2. Filter Status
    if (filterStatus !== 'all') {
      result = result.filter(item => item.status === filterStatus);
    }

    // 3. Filter Category [NEW]
    if (filterCategory !== 'all') {
      result = result.filter(item => item.category === filterCategory);
    }

    // 4. Sorting
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
          <h1 className={styles.title}>จัดการข่าวสาร</h1>
          <p className={styles.breadcrumb}>
            หน้าเว็บ / {" "}
            <span className="text-blue-600 font-medium">ข่าวสาร</span>
          </p>
        </div>
        <div className={styles.controls}>
          <input
            type="text" placeholder="ค้นหา..." className={styles.searchBox}
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* [NEW] Filter Category */}
          <select
            className={styles.filterSelect}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
          >
            <option value="all">ทุกประเภท</option>
            <option value="news">ข่าว</option>
            <option value="announcement">ประกาศ</option>
            <option value="activity">กิจกรรม</option>
          </select>

          {/* Filter Status */}
          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="published">เผยแพร่</option>
            <option value="draft">ฉบับร่าง</option>
          </select>

          <button className={`${styles.btn} ${styles.btnAdd}`} onClick={() => setIsModalOpen(true)}>
            + เพิ่มข่าว
          </button>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thSortable} onClick={() => handleSort('order')} style={{ width: '100px', textAlign: 'center' }}>
                ลำดับ <span className={sortConfig.key === 'order' ? styles.sortIconActive : styles.sortIcon}>{getSortIcon('order')}</span>
              </th>

              <th>รายละเอียดข่าว</th>

              {/* [NEW] Column Category */}
              <th className={styles.thSortable} onClick={() => handleSort('category')} style={{ width: '140px' }}>
                ประเภท <span className={sortConfig.key === 'category' ? styles.sortIconActive : styles.sortIcon}>{getSortIcon('category')}</span>
              </th>

              <th className={styles.thSortable} onClick={() => handleSort('createdAt')} style={{ width: '120px' }}>
                วันที่สร้าง <span className={sortConfig.key === 'createdAt' ? styles.sortIconActive : styles.sortIcon}>{getSortIcon('createdAt')}</span>
              </th>

              <th className={styles.thSortable} onClick={() => handleSort('updatedAt')} style={{ width: '120px' }}>
                แก้ไขล่าสุด <span className={sortConfig.key === 'updatedAt' ? styles.sortIconActive : styles.sortIcon}>{getSortIcon('updatedAt')}</span>
              </th>

              <th className={styles.thSortable} onClick={() => handleSort('status')} style={{ width: '100px', textAlign: 'center' }}>
                สถานะ <span className={sortConfig.key === 'status' ? styles.sortIconActive : styles.sortIcon}>{getSortIcon('status')}</span>
              </th>

              <th style={{ width: '80px', textAlign: 'center' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {processedNews.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  ไม่พบข้อมูลตามเงื่อนไข
                </td>
              </tr>
            ) : (
              processedNews.map((item) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#555' }}>{item.order}</td>
                  <td>
                    <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{item.content}</div>
                  </td>

                  {/* [NEW] Dropdown Category in Table */}
                  <td>
                    <select
                      className={styles.tableSelect}
                      value={item.category}
                      onChange={(e) => changeCategory(item.id, e.target.value as NewsCategory)}
                    >
                      <option value="news">ข่าว</option>
                      <option value="announcement">ประกาศ</option>
                      <option value="activity">กิจกรรม</option>
                    </select>
                  </td>

                  <td>{item.createdAt}</td>
                  <td>{item.updatedAt}</td>

                  <td style={{ textAlign: 'center' }}>
                    <span
                      className={`${styles.badge} ${item.status === 'published' ? styles.published : styles.draft}`}
                      onClick={() => toggleStatus(item.id)}
                    >
                      {item.status === 'published' ? 'เผยแพร่' : 'ฉบับร่าง'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className={`${styles.btn} ${styles.btnDelete}`} onClick={() => deleteNews(item.id)}>
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalHeader}>เพิ่มข่าวใหม่</h2>
            <form onSubmit={handleAddNews}>
              <div className={styles.formGroup}>
                <label style={{ marginBottom: '0.5rem', display: 'block' }}>หัวข้อข่าว</label>
                <input type="text" className={styles.input} value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
              </div>

              {/* [NEW] Select Category in Form */}
              <div className={styles.formGroup}>
                <label style={{ marginBottom: '0.5rem', display: 'block' }}>ประเภท</label>
                <select
                  className={styles.modalSelect}
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as NewsCategory)}
                >
                  <option value="news">ข่าว</option>
                  <option value="announcement">ประกาศ</option>
                  <option value="activity">กิจกรรม</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label style={{ marginBottom: '0.5rem', display: 'block' }}>เนื้อหา</label>
                <textarea rows={4} className={styles.textarea} value={newContent} onChange={e => setNewContent(e.target.value)} required />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
                <button type="submit" className={`${styles.btn} ${styles.btnSave}`}>บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}