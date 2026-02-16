'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './news.module.css';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import Swal from 'sweetalert2';

// --- Types & Interfaces ---
// กำหนดสถานะของข่าว: เผยแพร่ หรือ ฉบับร่าง
type NewsStatus = 'published' | 'draft';
// กำหนดประเภทของข่าว: ข่าวทั่วไป, ประกาศ, หรือ กิจกรรม
type NewsCategory = 'news' | 'announcement' | 'activity';

// โครงสร้างข้อมูลข่าว
interface NewsItem {
  id: number;
  order: number;           // ลำดับการแสดงผล
  title: string;           // หัวข้อข่าว
  content: string;         // เนื้อหาข่าว (HTML)
  year: number;            // ปีที่สร้าง
  category: NewsCategory;  // หมวดหมู่
  status: NewsStatus;      // สถานะ
  createdAt: string;       // วันที่สร้าง
  updatedAt: string;       // วันที่แก้ไขล่าสุด
}

// โครงสร้างการตั้งค่าการเรียงลำดับ (Sorting)
interface SortConfig {
  key: 'createdAt' | 'updatedAt' | 'status' | 'order' | 'category';
  direction: 'asc' | 'desc';
}

// ประเภทตัวกรอง (Filters)
type FilterStatus = 'all' | 'published' | 'draft';
type FilterCategory = 'all' | NewsCategory;

// URL ของ API สำหรับจัดการข้อมูลข่าว
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/news`;

/**
 * NewsPage - หน้าหลักสำหรับจัดการรายการข่าวประชาสัมพันธ์ (ตารางรายการ)
 */
export default function NewsPage() {
  // --- States ---
  const [newsList, setNewsList] = useState<NewsItem[]>([]); // เก็บรายการข่าวทั้งหมดที่โหลดมาจาก API
  const [isLoading, setIsLoading] = useState(true);          // สถานะการโหลดข้อมูล

  // UI States สำหรับการค้นหาและกรอง
  const [searchQuery, setSearchQuery] = useState('');       // เก็บข้อความที่ใช้ค้นหา
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');      // ตัวกรองสถานะ
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');  // ตัวกรองหมวดหมู่
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'order', direction: 'desc' }); // การเรียงลำดับเริ่มต้น (ตามลำดับ มากไปน้อย)

  /**
   * fetchNews - ฟังก์ชันโหลดข้อมูลข่าวจาก API
   * ใช้ useCallback เพื่อป้องกันการสร้างฟังก์ชันใหม่โดยไม่จำเป็นเมื่อเรนเดอร์
   */
  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setNewsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      // แสดงข้อความแจ้งเตือนหากโหลดไม่สำเร็จ
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลข่าวได้',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // โหลดข้อมูลเมื่อคอมโพเนนต์ถูกติดตั้ง (Mount)
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  /**
   * deleteNews - ฟังก์ชันลบข่าว
   * มีการใช้ SweetAlert2 เพื่อยืนยันก่อนลบจริง
   */
  const deleteNews = async (id: number) => {
    // 1. แสดง Popup ยืนยันการลบ
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

    // 2. หากผู้ใช้กดยืนยัน (Yes)
    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete');

        // อัปเดต State ในโปรแกรมเพื่อลบแถวออกจากตารางทันทีโดยไม่ต้อง Refresh หน้า
        setNewsList(prev => prev.filter(item => item.id !== id));

        // แจ้งเตือนเมื่อลบสำเร็จ
        Swal.fire({
          title: 'ลบสำเร็จ!',
          text: 'ข้อมูลข่าวถูกลบเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#2563eb',
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบข้อมูลได้',
          confirmButtonColor: '#2563eb',
        });
      }
    }
  };

  /**
   * handleSort - จัดการเมื่อคลิกที่หัวตารางเพื่อเรียงลำดับ
   */
  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(current => ({
      key,
      // หากคลิกคอลัมน์เดิม ให้สลับจาก 'desc' เป็น 'asc' และกลับกัน
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  /**
   * getSortIcon - แสดงไอคอน (ลูกศร) ความจุการเรียงลำดับในหัวตาราง
   */
  const getSortIcon = (key: SortConfig['key']) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  /**
   * formatDateTime - ฟังก์ชันช่วยจัดรูปแบบวันที่และเวลาให้น่าอ่าน
   */
  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return { date: '', time: '' };
    // กรณีข้อมูลมาเป็นรูปแบบ "YYYY-MM-DD HH:mm:ss"
    if (dateTimeStr.includes(' ')) {
      const [date, time] = dateTimeStr.split(' ');
      return { date, time };
    }
    // กรณีข้อมูลมาเป็นรูปแบบ ISO Strings
    const dt = new Date(dateTimeStr);
    const date = dt.toISOString().split('T')[0];
    const time = dt.toTimeString().slice(0, 8);
    return { date, time };
  };

  /**
   * processedNews - ข้อมูลข่าวที่ผ่านการกรอง (Filter), ค้นหา (Search), และเรียงลำดับ (Sort) แล้ว
   * ใช้ useMemo เพื่อคำนวณใหม่เฉพาะเมื่อข้อมูลต้นทางหรือเงื่อนไขเปลี่ยนเท่านั้น
   */
  const processedNews = useMemo(() => {
    let result = [...newsList];

    // 1. การค้นหา (Search) ตามหัวข้อข่าว
    if (searchQuery) result = result.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. การกรองตามสถานะ (Status)
    if (filterStatus !== 'all') result = result.filter(item => item.status === filterStatus);

    // 3. การกรองตามหมวดหมู่ (Category)
    if (filterCategory !== 'all') result = result.filter(item => item.category === filterCategory);

    // 4. การเรียงลำดับ (Sorting)
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [newsList, searchQuery, filterStatus, filterCategory, sortConfig]);

  // --- UI Rendering ---
  return (
    <div className={styles.container}>
      {/* ส่วนหัวของหน้าและ Breadcrumbs */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>จัดการข่าวประชาสัมพันธ์</h1>
          <p className={styles.breadcrumb}>
            <span className="text-blue-600 font-medium">ข่าวประชาสัมพันธ์</span>
          </p>
        </div>

        {/* ส่วนปุ่มควบคุมการค้นหา กรองข้อมูล และเพิ่มข่าว */}
        <div className={styles.controls}>
          {/* ช่องค้นหาข่าว */}
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

          {/* ตัวเลือกกรองตามประเภท */}
          <select className={styles.filterSelect} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as FilterCategory)} aria-label="Filter by category">
            <option value="all">ทุกประเภท</option>
            <option value="news">ข่าว</option>
            <option value="announcement">ประกาศ</option>
            <option value="activity">กิจกรรม</option>
          </select>

          {/* ตัวเลือกกรองตามสถานะ */}
          <select className={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)} aria-label="Filter by status">
            <option value="all">สถานะทั้งหมด</option>
            <option value="published">เผยแพร่</option>
            <option value="draft">ฉบับร่าง</option>
          </select>

          {/* ปุ่มสำหรับไปที่หน้าสร้างข่าวใหม่ */}
          <Link href="/backoffice/module/web/news/create" className={`${styles.btn} ${styles.btnAdd}`}>
            <Plus size={18} /> เพิ่มข่าว
          </Link>
        </div>
      </header>

      {/* ส่วนตารางแสดงรายการข้อมูลข่าว */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {/* หัวตารางที่คลิกเพื่อเรียงลำดับได้ */}
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
              // แสดงสถานะการโหลด
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>กำลังโหลดข้อมูล...</td></tr>
            ) : processedNews.length === 0 ? (
              // กรณีไม่พบข้อมูล
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>ไม่พบข้อมูลตามเงื่อนไข</td></tr>
            ) : (
              // วนลูปแสดงรายการข่าวแต่ละแถว
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
                    {/* Badge แสดงสถานะ ข่าว/ฉบับร่าง พร้อมสีสันที่แตกต่างกัน */}
                    <span className={`${styles.badge} ${item.status === 'published' ? styles.published : styles.draft}`}>
                      {item.status === 'published' ? 'เผยแพร่' : 'ฉบับร่าง'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <div className={styles.actionButtons}>
                      {/* ปุ่มแก้ไข (ไปหน้าแก้ไขรายบุคคล) */}
                      <Link href={`/backoffice/module/web/news/edit/${item.id}`} className={`${styles.btn} ${styles.btnEdit}`}>
                        <Edit size={18} />
                      </Link>
                      {/* ปุ่มลบ (เรียกฟังก์ชันยืนยันการลบ) */}
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