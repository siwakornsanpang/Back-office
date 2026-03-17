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
    id: 'header-council-web',
    title: 'เว็บไซต์สภา',
    isHeader: true,
    permission: 'manage_home',
  },

  { id: 'council-web-home', title: 'จัดการหน้าแรก', href: '/backoffice/module/council-web/home', icon: <LayoutDashboard size={20} />, permission: 'manage_home' },
  {
    id: 'council-web-about',
    title: 'เกี่ยวกับองค์กร',
    icon: <Building2 size={20} />,
    permission: 'manage_about',
    submenu: [
      { id: 'council-web-about-history', title: 'ทำเนียบสภา', href: '/backoffice/module/council-web/about/history', },
      { id: 'council-web-about-board', title: 'กรรมการสภา', href: '/backoffice/module/council-web/about/council', },
      { id: 'council-web-about-honor', title: 'เกียรติประวัติ', href: '/backoffice/module/council-web/about/honor', },
    ]
  },
  { id: 'council-web-news', title: 'ข่าวประชาสัมพันธ์', href: '/backoffice/module/council-web/news', icon: <Megaphone size={20} />, permission: 'manage_news' },
  { id: 'council-web-service', title: 'บริการ',
    icon: <LayoutGrid size={20} />, permission: 'manage_service' ,
     submenu: [
      { id: 'council-web-service-medicine', title: 'ความรู้เรื่องยา', href: '/backoffice/module/council-web/service/medicine', },
      { id: 'council-web-service-people', title: 'โครงการของประชาชน', href: '/backoffice/module/council-web/service/people', },
      { id: 'council-web-service-e-service', title: 'E-service', href: '/backoffice/module/council-web/service/service-e', },
      
    ]
  },

  {
    id: 'council-web-agency', title: 'หน่วยงาน', icon: <Landmark size={20} />,
    permission: 'manage_agency',
    href: '/backoffice/module/council-web/agency',
  },

  {
    id: 'council-web-law',
    title: 'กฎหมาย',
    icon: <Scale size={20} />,
    permission: 'manage_law',
    href: '/backoffice/module/council-web/law',
  },

  { id: 'council-web-setting', title: 'ตั้งค่าเว็บไซต์', href: '/backoffice/module/council-web/setting', icon: <Settings size={20} />, permission: 'manage_web_settings' },

  {
    id: 'header-pharmacist-web',
    title: 'เว็บไซต์เภสัชกร',
    isHeader: true,
    permission: 'manage_home',
  },

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