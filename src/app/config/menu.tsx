import {
  Globe,
  BookOpen,
  Landmark,
  GraduationCap,
  Monitor,
  CreditCard,
  Settings,
} from 'lucide-react';
import type { ReactNode } from 'react';

// ============================================
// Menu Config — Permission-Based
// ============================================
// แต่ละเมนูกำหนด `permission` key ที่ต้องมีถึงจะเห็น
// Sidebar จะดึง permissions ของ user จาก API แล้วกรอง

export interface MenuItem {
  id: string;
  title: string;
  icon?: ReactNode;
  href?: string;
  submenu?: MenuItem[];
  isHeader?: boolean;
  permission?: string;  // permission key ที่ต้องมีถึงจะเห็นเมนูนี้ (ไม่กำหนด = ทุกคนเห็น)
}

/**
 * กรอง menu items ตาม permissions ของ user
 * ถ้า item.permission ไม่กำหนด → ทุกคนเห็น
 * ถ้า item.permission กำหนดไว้ → user ต้องมี permission นั้น
 */
export function filterMenuByPermission(items: MenuItem[], userPermissions: string[]): MenuItem[] {
  return items
    .filter(item => {
      if (!item.permission) return true;
      return userPermissions.includes(item.permission);
    })
    .map(item => {
      if (item.submenu && item.submenu.length > 0) {
        const filteredSubmenu = filterMenuByPermission(item.submenu, userPermissions);
        if (filteredSubmenu.length === 0) return null;
        return { ...item, submenu: filteredSubmenu };
      }
      return item;
    })
    .filter(Boolean) as MenuItem[];
}

// ============================================
// Menu Data — แต่ละ item ผูกกับ permission key
// ============================================
export const SIDEBAR_DATA: MenuItem[] = [
  {
    id: 'council-web-hub',
    title: 'เว็บไซต์สภา',
    href: '/backoffice/module/council-web',
    icon: <Globe size={20} />,
    permission: 'manage_home',
  },
  {
    id: 'pharmacist-web-hub',
    title: 'เว็บไซต์เภสัชกร',
    href: '/backoffice/module/pharmacist-web',
    icon: <BookOpen size={20} />,
    permission: 'manage_web_pharmacist',
  },
  {
    id: 'register-hub',
    title: 'ทะเบียนเภสัช',
    icon: <Landmark size={20} />,
    href: '/backoffice/module/register',
    permission: 'manage_register',
  },
  {
    id: 'royalcollege-hub',
    title: 'ราชวิทยาลัย',
    icon: <GraduationCap size={20} />,
    href: '/backoffice/module/royalcollege',
    permission: 'manage_royalcollege',
  },
  {
    id: 'eservice-hub',
    title: 'E-Service',
    icon: <Monitor size={20} />,
    href: "/backoffice/module/e-service",
    permission: 'manage_eservice',
  },
  {
    id: 'bill-hub',
    title: 'การเงิน / ธุรกรรม',
    icon: <CreditCard size={20} />,
    href: '/backoffice/module/bill',
    permission: 'manage_tran',
  },
  {
    id: 'setting-hub',
    title: 'ตั้งค่า',
    icon: <Settings size={20} />,
    href: '/backoffice/module/setting',
    permission: 'manage_users', // using existing permission
  },
];
