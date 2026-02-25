'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Trash2, Loader2, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import { authFetch } from '@/app/utils/authFetch';
import RoleBadge from '@/app/components/ui/RoleBadge';
import styles from './users.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type User = {
  id: number;
  username: string;
  displayName: string;
  role: string;
  createdAt: string;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('viewer');

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await authFetch(`${API_URL}/auth/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch roles จาก API (dynamic)
  const fetchRoles = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/permissions/roles`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRoleOptions(data.map((r: any) => ({ value: r.role, label: r.role })));
        }
      }
    } catch (err) {
      console.error('Failed to fetch roles', err);
      // fallback
      setRoleOptions([
        { value: 'admin', label: 'admin' },
        { value: 'editor', label: 'editor' },
        { value: 'viewer', label: 'viewer' },
      ]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // Create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      Swal.fire('กรุณากรอกข้อมูล', 'ชื่อผู้ใช้และรหัสผ่านจำเป็นต้องกรอก', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      const res = await authFetch(`${API_URL}/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          displayName: displayName.trim() || username.trim(),
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire('ไม่สำเร็จ', data.message || 'ไม่สามารถสร้างผู้ใช้ได้', 'error');
        return;
      }

      Swal.fire({ icon: 'success', title: 'สร้างผู้ใช้สำเร็จ', text: `${data.user.displayName} (${data.user.role})`, timer: 2000, showConfirmButton: false });

      // Reset form
      setUsername('');
      setPassword('');
      setDisplayName('');
      setRole('viewer');

      // Refresh list
      fetchUsers();
    } catch {
      Swal.fire('Error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (user: User) => {
    const result = await Swal.fire({
      title: `ลบผู้ใช้ "${user.displayName}"?`,
      text: 'การดำเนินการนี้ไม่สามารถย้อนกลับได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await authFetch(`${API_URL}/auth/users/${user.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire('ไม่สำเร็จ', data.message || 'ไม่สามารถลบผู้ใช้ได้', 'error');
        return;
      }

      Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1500, showConfirmButton: false });
      fetchUsers();
    } catch {
      Swal.fire('Error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>จัดการผู้ใช้งาน</h2>
        <p className={styles.breadcrumb}>
          ตั้งค่า / <span style={{ color: '#2563eb', fontWeight: 500 }}>จัดการผู้ใช้งาน</span>
        </p>
      </div>

      {/* Create User Form */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <UserPlus size={20} color="#2563eb" />
          เพิ่มผู้ใช้ใหม่
        </h3>

        <form onSubmit={handleCreateUser}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>ชื่อผู้ใช้ (Username) *</label>
              <input
                className={styles.input}
                type="text"
                placeholder="เช่น webeditor01"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>รหัสผ่าน *</label>
              <input
                className={styles.input}
                type="password"
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>ชื่อที่แสดง</label>
              <input
                className={styles.input}
                type="text"
                placeholder="เช่น สมชาย ใจดี"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>บทบาท (Role)</label>
              <select
                className={styles.select}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSaving}>
              {isSaving ? <Loader2 size={16} className={styles.spinner} /> : <UserPlus size={16} />}
              {isSaving ? 'กำลังสร้าง...' : 'สร้างผู้ใช้'}
            </button>
          </div>
        </form>
      </div>

      {/* User List */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <Users size={20} color="#2563eb" />
          ผู้ใช้ทั้งหมด ({users.length})
        </h3>

        {isLoading ? (
          <div className={styles.loading}>
            <Loader2 size={20} className={styles.spinner} />
            กำลังโหลด...
          </div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>ยังไม่มีผู้ใช้ในระบบ</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ผู้ใช้</th>
                  <th>บทบาท</th>
                  <th>วันที่สร้าง</th>
                  <th style={{ width: 80, textAlign: 'center' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                          {(user.displayName || user.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.userName}>{user.displayName}</div>
                          <div className={styles.userUsername}>@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <RoleBadge role={user.role} />
                    </td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className={`${styles.btn} ${styles.btnDanger}`}
                        onClick={() => handleDeleteUser(user)}
                        title="ลบผู้ใช้"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}