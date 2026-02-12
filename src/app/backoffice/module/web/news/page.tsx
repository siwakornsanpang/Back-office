'use client';

import React, { useState, useMemo, useEffect } from 'react';
import styles from './news.module.css';
import { Edit, Trash2, Search } from 'lucide-react';
import Editor from '@/app/components/editor/editor';
import HtmlContent from '@/app/components/editor/HtmlContent';

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

  // Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); // [NEW] เช็คว่ากำลังแก้ไข ID ไหน

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<NewsCategory>('news');
  const [newStatus, setNewStatus] = useState<NewsStatus>('draft');
  const [newOrder, setNewOrder] = useState<number>(0);

  // Fetch Data
  const fetchNews = async () => {
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
  };

  useEffect(() => {
    fetchNews();
  }, []);

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

  // [NEW] ฟังก์ชันสำหรับเคลียร์ Form และปิด Modal
  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setNewCategory('news');
    setNewStatus('draft');
    setNewOrder(0);
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
    setNewOrder(item.order);
    setIsModalOpen(true);
  };

  // [UPDATED] รวม Logic เพิ่มและแก้ไขไว้ในฟังก์ชันเดียว
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || newOrder <= 0) return;

    // ตรวจสอบลำดับซ้ำ (ต้องไม่ซ้ำกับข้อมูลอื่น ยกเว้นตัวเองตอนแก้ไข)
    const isDuplicateOrder = newsList.some(item => item.order === newOrder && item.id !== editingId);
    if (isDuplicateOrder) {
      alert('เลขลำดับนี้มีอยู่แล้ว กรุณาเลือกหมายเลขอื่น');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 8);
    const todayDateTime = `${today} ${currentTime}`;

    try {
      if (editingId) {
        // --- กรณีแก้ไข (Edit) ---
        const itemToUpdate = newsList.find(item => item.id === editingId);
        if (!itemToUpdate) return;

        const updatedItem = {
          ...itemToUpdate,
          title: newTitle,
          content: newContent,
          category: newCategory,
          status: newStatus,
          order: newOrder,
          updatedAt: todayDateTime
        };

        const res = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem),
        });

        if (!res.ok) throw new Error('Failed to update');

        // Update local state by reloading from server
        fetchNews();

      } else {
        // --- กรณีเพิ่มใหม่ (Add) ---
        const currentYear = new Date().getFullYear();

        const newItem = {
          // id will be generated by API usually, but if we need to send it:
          id: Date.now(),
          order: newOrder,
          title: newTitle,
          content: newContent,
          year: currentYear,
          category: newCategory,
          status: newStatus,
          updatedAt: todayDateTime,
        };

        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        });

        if (!res.ok) throw new Error('Failed to create');

        // Reload table data from server
        fetchNews();
      }

      resetForm(); // บันทึกเสร็จแล้วปิดและล้างค่า
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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
          <Search className={styles.searchIcon} size={20} />
          <input type="text" placeholder="ค้นหา..." className={styles.searchBox} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                    <div>{item.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}><HtmlContent content={item.content} /></div>
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

              <div className={styles.formRow}>
                <div className={styles.formCol} style={{ flex: '0 0 auto', width: '80px' }}>
                  <label style={{ marginBottom: '0.5rem', display: 'block' }}>ลำดับที่</label>
                  <input type="number" className={styles.input} min="1" value={newOrder || ''} onChange={e => setNewOrder(parseInt(e.target.value) || 0)} required />
                </div>

                <div className={styles.formCol}>
                  <label style={{ marginBottom: '0.5rem', display: 'block' }}>หัวข้อ</label>
                  <input type="text" className={styles.input} value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder='กรุณาระบุหัวข้อข่าว...' required />
                </div>
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
                <Editor
                  label="เนื้อหาข่าว"
                  value={newContent}
                  onChange={setNewContent}
                  placeholder="กรุณาระบุรายละเอียดข่าว..."
                />
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