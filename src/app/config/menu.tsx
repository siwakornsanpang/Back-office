import {
  Pill,
  FileText,
  Users,
  Settings,
  LayoutDashboard,
  Building2,
  Megaphone,
  LayoutGrid,
  Landmark,
  Scale,
  Book,
  Shield,
} from 'lucide-react';

// ============================================
// Menu Config — Permission-Based
// ============================================
// แต่ละเมนูกำหนด `permission` key ที่ต้องมีถึงจะเห็น
// Sidebar จะดึง permissions ของ user จาก API แล้วกรอง

export interface MenuItem {
  id: string;
  title: string;
  icon?: any;
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
  // --- หน้าเว็บ ---
  {
    id: 'header-web',
    title: 'หน้าเว็บ',
    isHeader: true,
    permission: 'manage_home',
  },

  { id: 'web-home', title: 'จัดการหน้าแรก', href: '/backoffice/module/web/home', icon: <LayoutDashboard size={20} />, permission: 'manage_home' },
  {
    id: 'web-about',
    title: 'เกี่ยวกับองค์กร',
    icon: <Building2 size={20} />,
    permission: 'manage_about',
    submenu: [
      { id: 'web-about-history', title: 'ทำเนียบสภา', href: '/backoffice/module/web/about/history',  },
      { id: 'web-about-board', title: 'กรรมการสภา', href: '/backoffice/module/web/about/council', },
      { id: 'web-about-honor', title: 'เกียรติประวัติ', href: '/backoffice/module/web/about/honor',  },
    ]
  },
  { id: 'web-news', title: 'ข่าวประชาสัมพันธ์', href: '/backoffice/module/web/news', icon: <Megaphone size={20} />, permission: 'manage_news' },
  { id: 'web-service', title: 'บริการ', href: '/backoffice/module/web/service', icon: <LayoutGrid size={20} />, permission: 'manage_service' },

  { id: 'web-agency', title: 'หน่วยงาน', icon: <Landmark size={20} />,
    permission: 'manage_agency',
    href: '/backoffice/module/web/agency',
  },

  {
    id: 'web-law',
    title: 'กฎหมาย',
    icon: <Scale size={20} />,
    permission: 'manage_law',
    href: '/backoffice/module/web/law',
  },

  { id: 'web-setting', title: 'ตั้งค่าเว็บไซต์', href: '/backoffice/module/web/setting', icon: <Settings size={20} />, permission: 'manage_web_settings' },

  // --- ทะเบียนเภสัช ---
  {
    id: 'header-pharmacy',
    title: 'ทะเบียนเภสัช',
    isHeader: true,
    permission: 'manage_register',
  },
  {
    id: 'module-pharmacy',
    title: 'ทะเบียนเภสัช',
    icon: <Pill size={20} />,
    href: '/backoffice/module/register',
    permission: 'manage_register',
  },


  {
    id: 'header-royalcollege',
    title: 'ราชวิทยาลัย',
    isHeader: true,
    permission: 'manage_royalcollege',
  },
  {
    id: 'module-royalcollege',
    title: 'จัดการราชวิทยาลัย',
    icon: <Book size={20} />,
    href: '/backoffice/module/royalcollege',
    permission: 'manage_royalcollege',
  },

  // --- Placeholder modules ---
  {
    id: 'header-eservice',
    title: 'E-Service',
    isHeader: true,
    permission: 'manage_eservice',
  },
  {
    id: 'module-eservice',
    title: 'E-Service',
    icon: <Users size={20} />,
    href: "/backoffice/module/e-service",
    permission: 'manage_eservice',
  },


  {
    id: 'header-tran',
    title: 'การเงิน/ธุรกรรม',
    isHeader: true,
    permission: 'manage_tran',
  },
  {
    id: 'module-tran',
    title: 'การเงิน/ธุรกรรม',
    icon: <FileText size={20} />,
    href: '/backoffice/module/bill',
    permission: 'manage_tran',
  },

  // --- การตั้งค่า (admin only) ---
  {
    id: 'header-settings',
    title: 'การตั้งค่า',
    isHeader: true,
    permission: 'manage_users',
  },
  {
    id: 'module-settings',
    title: 'จัดการผู้ใช้',
    icon: <Settings size={20} />,
    href: '/backoffice/module/setting',
    permission: 'manage_users',
  },
  {
    id: 'module-permissions',
    title: 'จัดการสิทธิ์',
    icon: <Shield size={20} />,
    href: '/backoffice/module/setting/permissions',
    permission: 'manage_roles',
  },
];