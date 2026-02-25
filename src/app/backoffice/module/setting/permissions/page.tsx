'use client';

import { useState, useEffect } from 'react';
import { Shield, Check, Loader2, ChevronDown, ChevronUp, Plus, X, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { authFetch } from '@/app/utils/authFetch';
import styles from './permissions.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Permission {
  id: number;
  key: string;
  label: string;
  group: string | null;
}

interface RoleInfo {
  role: string;
  permissionCount: number;
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [rolePerms, setRolePerms] = useState<Record<string, string[]>>({});
  const [editingPerms, setEditingPerms] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({});

  // สร้าง Role ใหม่
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const fetchData = async () => {
    try {
      // ดึง permissions
      const permsRes = await authFetch(`${API_URL}/permissions`);
      const permsData = await permsRes.json();
      const permsArray = Array.isArray(permsData) ? permsData : [];
      setPermissions(permsArray);
      setSeeded(permsArray.length > 0);

      // ดึง roles ทั้งหมด
      const rolesRes = await authFetch(`${API_URL}/permissions/roles`);
      const rolesData = await rolesRes.json();
      const rolesArray = Array.isArray(rolesData) ? rolesData : [];
      setRoles(rolesArray);

      // ดึง permissions ของแต่ละ role (ยกเว้น admin)
      const rolePermsMap: Record<string, string[]> = {};
      for (const r of rolesArray) {
        if (r.role === 'admin') continue;
        try {
          const res = await authFetch(`${API_URL}/permissions/roles/${r.role}`);
          const data = await res.json();
          rolePermsMap[r.role] = Array.isArray(data) ? data : [];
        } catch {
          rolePermsMap[r.role] = [];
        }
      }
      setRolePerms(rolePermsMap);
      setEditingPerms(JSON.parse(JSON.stringify(rolePermsMap)));
      setHasChanges({});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Seed
  const handleSeed = async () => {
    try {
      const res = await authFetch(`${API_URL}/permissions/seed`, { method: 'POST' });
      if (res.ok) {
        Swal.fire('สำเร็จ', 'สร้าง Permissions เริ่มต้นเรียบร้อย', 'success');
        fetchData();
      } else {
        const data = await res.json();
        Swal.fire('Info', data.message, 'info');
      }
    } catch { Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error'); }
  };

  // Toggle permission (local only)
  const togglePermission = (role: string, permKey: string) => {
    const current = editingPerms[role] || [];
    const updated = current.includes(permKey)
      ? current.filter(k => k !== permKey)
      : [...current, permKey];
    setEditingPerms(prev => ({ ...prev, [role]: updated }));
    const original = rolePerms[role] || [];
    const isDifferent = JSON.stringify([...updated].sort()) !== JSON.stringify([...original].sort());
    setHasChanges(prev => ({ ...prev, [role]: isDifferent }));
  };

  // บันทึก
  const handleSave = async (role: string) => {
    const updated = editingPerms[role] || [];
    setSaving(role);
    try {
      const res = await authFetch(`${API_URL}/permissions/roles/${role}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: updated }),
      });
      if (res.ok) {
        setRolePerms(prev => ({ ...prev, [role]: [...updated] }));
        setHasChanges(prev => ({ ...prev, [role]: false }));
        Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', text: `อัพเดทสิทธิ์ ${role} แล้ว`, timer: 1500, showConfirmButton: false });
      } else { throw new Error(); }
    } catch { Swal.fire('Error', 'บันทึกไม่สำเร็จ', 'error'); }
    finally { setSaving(null); }
  };

  // ยกเลิก
  const handleCancel = (role: string) => {
    setEditingPerms(prev => ({ ...prev, [role]: [...(rolePerms[role] || [])] }));
    setHasChanges(prev => ({ ...prev, [role]: false }));
  };

  // สร้าง Role ใหม่
  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      Swal.fire('Error', 'กรุณากรอกชื่อ Role', 'error');
      return;
    }
    const roleName = newRoleName.trim().toLowerCase().replace(/\s+/g, '_');
    try {
      const res = await authFetch(`${API_URL}/permissions/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleName }),
      });
      if (res.ok) {
        setNewRoleName('');
        setShowAddRole(false);
        Swal.fire({ icon: 'success', title: 'สร้าง Role สำเร็จ', text: `Role "${roleName}" ถูกสร้างแล้ว`, timer: 1500, showConfirmButton: false });
        fetchData();
      } else {
        const data = await res.json();
        Swal.fire('Error', data.message, 'error');
      }
    } catch { Swal.fire('Error', 'ไม่สามารถเชื่อมต่อ API', 'error'); }
  };

  // ลบ Role
  const handleDeleteRole = async (role: string) => {
    const result = await Swal.fire({
      title: `ลบ Role "${role}"?`,
      text: 'จะลบ role พร้อมสิทธิ์ทั้งหมดที่กำหนดไว้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    });
    if (!result.isConfirmed) return;

    try {
      const res = await authFetch(`${API_URL}/permissions/roles/${role}`, { method: 'DELETE' });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1500, showConfirmButton: false });
        fetchData();
      } else {
        const data = await res.json();
        Swal.fire('Error', data.message, 'error');
      }
    } catch { Swal.fire('Error', 'ไม่สามารถลบได้', 'error'); }
  };

  // ลบ Permission
  const handleDeletePermission = async (key: string) => {
    const result = await Swal.fire({
      title: `ลบสิทธิ์ "${key}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    });
    if (!result.isConfirmed) return;

    try {
      const res = await authFetch(`${API_URL}/permissions/${key}`, { method: 'DELETE' });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1500, showConfirmButton: false });
        fetchData();
      } else {
        Swal.fire('Error', 'ลบไม่สำเร็จ', 'error');
      }
    } catch { Swal.fire('Error', 'ไม่สามารถเชื่อมต่อ API', 'error'); }
  };

  // Group permissions
  const groupedPermissions = (permissions || []).reduce((acc, perm) => {
    const group = perm.group || 'อื่นๆ';
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Loader2 size={24} className={styles.spinner} />
        กำลังโหลด...
      </div>
    );
  }

  if (!seeded) {
    return (
      <div className={styles.container}>
        <div className={styles.seedCard}>
          <Shield size={48} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
          <h2>ยังไม่มีข้อมูลสิทธิ์ในระบบ</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            กดปุ่มด้านล่างเพื่อสร้าง Permissions เริ่มต้น พร้อมกำหนดสิทธิ์ default ให้แต่ละ Role
          </p>
          <button onClick={handleSeed} className={styles.btnSeed}>
            <Shield size={20} /> สร้าง Permissions เริ่มต้น
          </button>
        </div>
      </div>
    );
  }

  // แยก admin ออก — roles ที่แก้ไขได้
  const manageableRoles = roles.filter(r => r.role !== 'admin');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>จัดการสิทธิ์การใช้งาน</h1>
          <p className={styles.subtitle}>กำหนดสิทธิ์ให้แต่ละ Role — ติ๊กเลือก แล้วกด "บันทึกสิทธิ์"</p>
        </div>
        <button onClick={() => setShowAddRole(!showAddRole)} className={styles.btnAdd}>
          {showAddRole ? <X size={18} /> : <Plus size={18} />}
          {showAddRole ? 'ปิด' : 'เพิ่ม Role ใหม่'}
        </button>
      </div>

      {/* ฟอร์มเพิ่ม Role ใหม่ */}
      {showAddRole && (
        <div className={styles.addForm}>
          <h3 className={styles.addFormTitle}>สร้าง Role ใหม่</h3>
          <div className={styles.addFormGrid}>
            <div>
              <label className={styles.formLabel}>ชื่อ Role (ภาษาอังกฤษ, ไม่มีเว้นวรรค)</label>
              <input
                type="text"
                placeholder="เช่น reporter"
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
                className={styles.formInput}
              />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            สร้างแล้วสามารถกำหนดสิทธิ์ให้ Role นี้ได้ทันที + ตั้งค่าให้ผู้ใช้ในหน้า "ตั้งค่าระบบ"
          </p>
          <button onClick={handleAddRole} className={styles.btnSave}>
            <Plus size={16} /> สร้าง Role
          </button>
        </div>
      )}

      {/* Admin info */}
      <div className={styles.adminInfo}>
        <Shield size={16} />
        <strong>Admin</strong> — ได้ทุกสิทธิ์โดยอัตโนมัติ ไม่ต้องตั้งค่า
      </div>

      {/* Role cards */}
      {manageableRoles.map(({ role }) => {
        const isExpanded = expandedRole === role;
        const editPerms = editingPerms[role] || [];
        const changed = hasChanges[role] || false;

        return (
          <div key={role} className={styles.roleCard}>
            <div className={styles.roleCardHeader}>
              <div
                className={styles.roleInfo}
                onClick={() => setExpandedRole(isExpanded ? null : role)}
                style={{ flex: 1, cursor: 'pointer' }}
              >
                <span className={styles.roleName}>{role}</span>
                <span className={styles.permCount}>
                  {editPerms.length} / {permissions.length} สิทธิ์
                </span>
                {changed && <span className={styles.unsavedBadge}>มีการแก้ไข</span>}
              </div>
              <div className={styles.roleActions}>
                {saving === role && <Loader2 size={16} className={styles.spinner} />}
                <button
                  onClick={() => handleDeleteRole(role)}
                  className={styles.btnDeleteRole}
                  title="ลบ Role"
                >
                  <Trash2 size={16} />
                </button>
                <span onClick={() => setExpandedRole(isExpanded ? null : role)} style={{ cursor: 'pointer' }}>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
              </div>
            </div>

            {isExpanded && (
              <div className={styles.permissionGrid}>
                {Object.entries(groupedPermissions).map(([group, perms]) => (
                  <div key={group} className={styles.permGroup}>
                    <h4 className={styles.permGroupTitle}>{group}</h4>
                    {perms.map(perm => {
                      const isChecked = editPerms.includes(perm.key);
                      return (
                        <label key={perm.key} className={styles.permItem}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(role, perm.key)}
                            className={styles.checkbox}
                          />
                          <span className={`${styles.checkIcon} ${isChecked ? styles.checked : ''}`}>
                            {isChecked && <Check size={14} />}
                          </span>
                          <span className={styles.permLabel}>{perm.label}</span>
                          <span className={styles.permKey}>{perm.key}</span>
                        </label>
                      );
                    })}
                  </div>
                ))}

                {/* ปุ่มบันทึก / ยกเลิก */}
                <div className={styles.actionBar}>
                  <button onClick={() => handleCancel(role)} className={styles.btnCancel} disabled={!changed}>
                    ยกเลิก
                  </button>
                  <button onClick={() => handleSave(role)} className={styles.btnSave} disabled={!changed || saving === role}>
                    {saving === role ? (
                      <><Loader2 size={16} className={styles.spinner} /> กำลังบันทึก...</>
                    ) : (
                      <><Check size={16} /> บันทึกสิทธิ์</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
