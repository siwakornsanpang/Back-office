'use client';

import React, { useState, useMemo } from 'react';
import styles from './news.module.css';
import { Edit, Trash2, Search } from 'lucide-react';

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

// Mock Data
const MOCK_NEWS: NewsItem[] = [
  {
    id: 1, order: 1, title: 'สรุปผลประกอบการปี 2023', content: 'ดี', year: 2023, category: 'news', status: 'published', createdAt: '2023-12-20', updatedAt: '2023-12-25',
  },
  {
    id: 2, order: 2, title: 'เปิดตัวระบบ Backoffice ใหม่', content: 'ระบบใหม่', year: 2024, category: 'announcement', status: 'published', createdAt: '2024-02-15', updatedAt: '2024-02-15',
  },
  {
    id: 3, order: 3, title: 'กิจกรรมงานวันเด็ก', content: 'งานวันเด็กปีนี้สนุกมากเลย มากันเยอะๆ', year: 2024, category: 'activity', status: 'draft', createdAt: '2024-03-01', updatedAt: '2024-03-02',
  }
];

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>(MOCK_NEWS);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'order', direction: 'desc' });

  // Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); // [NEW] เช็คว่ากำลังแก้ไข ID ไหน
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<NewsCategory>('news');
  const [newStatus, setNewStatus] = useState<NewsStatus>('draft');

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

  const changeCategory = (id: number, newCat: NewsCategory) => {
    const today = new Date().toISOString().split('T')[0];
    setNewsList(prev => prev.map(item => {
      if (item.id === id) return { ...item, category: newCat, updatedAt: today };
      return item;
    }));
  };

  const deleteNews = (id: number) => {
    if (confirm('ยืนยันการลบข่าวนี้?')) {
      setNewsList(prev => prev.filter(item => item.id !== id));
    }
  };

  // [NEW] ฟังก์ชันสำหรับเคลียร์ Form และปิด Modal
  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setNewCategory('news');
    setNewStatus('draft');
    setEditingId(null); // เคลียร์สถานะการแก้ไข
    setIsModalOpen(false);
  };

  // [NEW] ฟังก์ชันกดปุ่ม "เพิ่มข่าว" (ต้องเคลียร์ค่าเก่าก่อนเปิด)
  const handleOpenAddModal = () => {
    resetForm(); // เคลียร์ค่าก่อน
    setIsModalOpen(true); // เปิด Modal
  };

  // [NEW] ฟังก์ชันกดปุ่ม "แก้ไข"
  const handleEditClick = (item: NewsItem) => {
    setEditingId(item.id);
    setNewTitle(item.title);
    setNewContent(item.content);
    setNewCategory(item.category);
    setNewStatus(item.status);
    setIsModalOpen(true);
  };

  // [UPDATED] รวม Logic เพิ่มและแก้ไขไว้ในฟังก์ชันเดียว
  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const today = new Date().toISOString().split('T')[0];

    if (editingId) {
      // --- กรณีแก้ไข (Edit) ---
      setNewsList(prev => prev.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            title: newTitle,
            content: newContent,
            category: newCategory,
            status: newStatus,
            updatedAt: today
          };
        }
        return item;
      }));
    } else {
      // --- กรณีเพิ่มใหม่ (Add) ---
      const currentYear = new Date().getFullYear();
      const maxOrder = newsList.length > 0 ? Math.max(...newsList.map(n => n.order)) : 0;

      const newItem: NewsItem = {
        id: Date.now(),
        order: maxOrder + 1,
        title: newTitle,
        content: newContent,
        year: currentYear,
        category: newCategory,
        status: newStatus,
        createdAt: today,
        updatedAt: today,
      };
      setNewsList([...newsList, newItem]);
    }

    resetForm(); // บันทึกเสร็จแล้วปิดและล้างค่า
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
          <Search className={styles.searchIcon} size={20} />
          <input type="text" placeholder="ค้นหา..." className={styles.searchBox} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
          
          {/* เรียกใช้ handleOpenAddModal แทนการ set true ตรงๆ */}
          <button className={`${styles.btn} ${styles.btnAdd}`} onClick={handleOpenAddModal}>+ เพิ่มข่าว</button>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thSortable} onClick={() => handleSort('order')} style={{ width: '80px', textAlign: 'center' }}>
                ลำดับ <span className={sortConfig.key === 'order' ? styles.sortIconActive : styles.sortIcon}>{getSortIcon('order')}</span>
              </th>
              <th>รายละเอียดข่าว</th>
              <th className={styles.thSortable} onClick={() => handleSort('category')} style={{ width: '130px' }}>
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
              <th style={{ width: '140px', textAlign: 'center' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {processedNews.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>ไม่พบข้อมูลตามเงื่อนไข</td></tr>
            ) : (
              processedNews.map((item) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#555' }}>{item.order}</td>
                  <td>
                    <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{item.content}</div>
                  </td>
                  <td>
                    <select className={styles.tableSelect} value={item.category} onChange={(e) => changeCategory(item.id, e.target.value as NewsCategory)}>
                      <option value="news">ข่าว</option>
                      <option value="announcement">ประกาศ</option>
                      <option value="activity">กิจกรรม</option>
                    </select>
                  </td>
                  <td>{item.createdAt}</td>
                  <td>{item.updatedAt}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`${styles.badge} ${item.status === 'published' ? styles.published : styles.draft}`} onClick={() => toggleStatus(item.id)}>
                      {item.status === 'published' ? 'เผยแพร่' : 'ฉบับร่าง'}
                    </span>
                  </td>
                  
                  {/* [UPDATED] ส่วนจัดการ: เพิ่มปุ่มแก้ไข */}
                  <td style={{ textAlign: 'center' }}>
                    <div className={styles.actionButtons}>
                      <button className={`${styles.btn} ${styles.btnEdit}`} onClick={() => handleEditClick(item)}>
                        <Edit size={18} />
                      </button>
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

      {/* Modal เพิ่ม/แก้ไข ข่าว */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={resetForm}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            {/* เปลี่ยนหัวข้อตามสถานะ */}
            <h2 className={styles.modalHeader}>{editingId ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่'}</h2>
            
            <form onSubmit={handleSaveNews}>

              <div className={styles.formGroup}>
                <label style={{ marginBottom: '0.5rem', display: 'block' }}>หัวข้อ</label>
                <input type="text" className={styles.input} value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formCol}>
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

                <div className={styles.formCol}>
                  <label style={{ marginBottom: '0.5rem', display: 'block' }}>สถานะ</label>
                  <select
                    className={styles.modalSelect}
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as NewsStatus)}
                  >
                    <option value="draft">ฉบับร่าง</option>
                    <option value="published">เผยแพร่</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label style={{ marginBottom: '0.5rem', display: 'block' }}>เนื้อหา</label>
                <textarea rows={4} className={styles.textarea} value={newContent} onChange={e => setNewContent(e.target.value)} required />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={resetForm}>ยกเลิก</button>
                <button type="submit" className={`${styles.btn} ${styles.btnSave}`}>บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}