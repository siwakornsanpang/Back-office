'use client';

import React, { useState, useMemo, useEffect } from 'react';
import styles from './agency.module.css';
import { Edit, Trash2, Search, ExternalLink } from 'lucide-react';

// Types
type AgencyStatus = 'online' | 'offline';

interface Agency {
  id: number;
  name: string;
  url: string;
  status: AgencyStatus;
  order: number;
  createdAt: string;
}

const API_URL = 'https://pharmacy-api-6w5d.onrender.com/agencies';

export default function AgencyPage() {
  const [agencyList, setAgencyList] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | AgencyStatus>('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form States
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formStatus, setFormStatus] = useState<AgencyStatus>('offline');
  const [formOrder, setFormOrder] = useState<number>(0);

  // Fetch Data
  const fetchAgencies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAgencyList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  // --- Functions ---

  const resetForm = () => {
    setFormName('');
    setFormUrl('');
    setFormStatus('offline');
    setFormOrder(0);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (item: Agency) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormUrl(item.url);
    setFormStatus(item.status);
    setFormOrder(item.order);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUrl.trim()) return;

    try {
      if (editingId) {
        // แก้ไข
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            url: formUrl,
            status: formStatus,
            order: formOrder,
          }),
        });
        if (!res.ok) throw new Error('Failed to update');
      } else {
        // เพิ่มใหม่
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            url: formUrl,
            status: formStatus,
            order: formOrder,
          }),
        });
        if (!res.ok) throw new Error('Failed to create');
      }

      fetchAgencies();
      resetForm();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('ยืนยันการลบหน่วยงานนี้?')) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        setAgencyList(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  const handleToggleStatus = async (item: Agency) => {
    const newStatus = item.status === 'online' ? 'offline' : 'online';
    try {
      const res = await fetch(`${API_URL}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setAgencyList(prev => prev.map(a => a.id === item.id ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  // --- Filtered Data ---
  const processedList = useMemo(() => {
    let result = [...agencyList];
    if (searchQuery) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      result = result.filter(item => item.status === filterStatus);
    }
    return result;
  }, [agencyList, searchQuery, filterStatus]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>จัดการหน่วยงาน</h1>
          <p className={styles.breadcrumb}>
            <span className="text-blue-600 font-medium">หน่วยงาน / Agency</span>
          </p>
        </div>
        <div className={styles.controls}>
          <Search size={20} style={{ color: '#999' }} />
          <input
            type="text"
            placeholder="ค้นหาชื่อหรือ URL..."
            className={styles.searchBox}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | AgencyStatus)}
            aria-label="Filter by status"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="online">ออนไลน์</option>
            <option value="offline">ออฟไลน์</option>
          </select>
          <button className={`${styles.btn} ${styles.btnAdd}`} onClick={handleOpenAddModal}>
            + เพิ่มหน่วยงาน
          </button>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '70px', textAlign: 'center' }}>ลำดับ</th>
              <th>ชื่อหน่วยงาน</th>
              <th>URL</th>
              <th style={{ width: '120px', textAlign: 'center' }}>สถานะ</th>
              <th style={{ width: '120px', textAlign: 'center' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>กำลังโหลดข้อมูล...</td></tr>
            ) : processedList.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>ไม่พบข้อมูลหน่วยงาน</td></tr>
            ) : (
              processedList.map((item) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#555' }}>{item.order}</td>
                  <td style={{ fontWeight: '500' }}>{item.name}</td>
                  <td>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.urlLink}>
                      {item.url} <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    </a>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      className={`${styles.badge} ${item.status === 'online' ? styles.online : styles.offline}`}
                      onClick={() => handleToggleStatus(item)}
                      title="คลิกเพื่อเปลี่ยนสถานะ"
                    >
                      {item.status === 'online' ? '🟢 ออนไลน์' : '⚫ ออฟไลน์'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className={styles.actionButtons}>
                      <button className={`${styles.btn} ${styles.btnEdit}`} onClick={() => handleEditClick(item)}>
                        <Edit size={18} />
                      </button>
                      <button className={`${styles.btn} ${styles.btnDelete}`} onClick={() => handleDelete(item.id)}>
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

      {/* Modal เพิ่ม/แก้ไข */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={resetForm}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalHeader}>{editingId ? 'แก้ไขหน่วยงาน' : 'เพิ่มหน่วยงานใหม่'}</h2>
            <form onSubmit={handleSave}>
              <div className={styles.formRow}>
                <div className={styles.formCol} style={{ flex: '0 0 auto', width: '80px' }}>
                  <label style={{ marginBottom: '0.5rem', display: 'block' }}>ลำดับ</label>
                  <input
                    type="number"
                    className={styles.input}
                    min="0"
                    value={formOrder}
                    onChange={e => setFormOrder(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className={styles.formCol}>
                  <label style={{ marginBottom: '0.5rem', display: 'block' }}>ชื่อหน่วยงาน</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="เช่น สำนักงานคณะกรรมการอาหารและยา"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label style={{ marginBottom: '0.5rem', display: 'block' }}>URL ลิงก์เว็บไซต์</label>
                <input
                  type="url"
                  className={styles.input}
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  placeholder="https://www.example.go.th"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label style={{ marginBottom: '0.5rem', display: 'block' }}>สถานะ</label>
                <select
                  className={styles.modalSelect}
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as AgencyStatus)}
                >
                  <option value="offline">ออฟไลน์ (ยังไม่แสดงที่หน้าเว็บ)</option>
                  <option value="online">ออนไลน์ (แสดงที่หน้าเว็บ)</option>
                </select>
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