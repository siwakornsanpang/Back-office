// ============================================
// Role Configuration — Single Source of Truth
// ============================================
// เพิ่ม role ใหม่ → แก้แค่ไฟล์นี้ไฟล์เดียว
// ทุก component (Sidebar, Header, Setting, etc.) import จากที่นี่

export type RoleKey = 'admin' | 'editor' | 'web_editor' | 'viewer';

export interface RoleConfig {
  label: string;       // English label
  labelTh: string;     // Thai label
  color: string;       // Badge text color
  bg: string;          // Badge background color
  defaultPage: string; // หน้าแรกหลัง login
}

export const ROLES: Record<RoleKey, RoleConfig> = {
  admin: {
    label: 'Admin',
    labelTh: 'ผู้ดูแลระบบ',
    color: '#ef4444',
    bg: '#fef2f2',
    defaultPage: '/backoffice',
  },
  editor: {
    label: 'Editor',
    labelTh: 'ผู้แก้ไข',
    color: '#f59e0b',
    bg: '#fffbeb',
    defaultPage: '/backoffice/module/web/home',
  },
  web_editor: {
    label: 'Web Editor',
    labelTh: 'ผู้จัดการเว็บ',
    color: '#3b82f6',
    bg: '#eff6ff',
    defaultPage: '/backoffice/module/web/home',
  },
  viewer: {
    label: 'Viewer',
    labelTh: 'ผู้ดู',
    color: '#6b7280',
    bg: '#f9fafb',
    defaultPage: '/backoffice/module/web/home',
  },
};

// --- Helper functions ---

/** ดึง config ของ role (ถ้าไม่เจอ return default viewer) */
export function getRoleConfig(role: string): RoleConfig {
  return ROLES[role as RoleKey] || ROLES.viewer;
}

/** ดึง label ภาษาไทย */
export function getRoleLabel(role: string): string {
  return getRoleConfig(role).labelTh;
}

/** ดึงหน้าแรกของ role */
export function getDefaultPage(role: string): string {
  return getRoleConfig(role).defaultPage;
}

/** ดึง role ทั้งหมดสำหรับ dropdown */
export function getRoleOptions(): { value: string; label: string }[] {
  return Object.entries(ROLES).map(([key, config]) => ({
    value: key,
    label: `${config.label} (${config.labelTh})`,
  }));
}

/** ดึง validRoles array สำหรับ validation */
export function getValidRoles(): string[] {
  return Object.keys(ROLES);
}
