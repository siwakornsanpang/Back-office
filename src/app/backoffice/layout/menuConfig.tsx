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
} from 'lucide-react';

// 1. กำหนด Type ของเมนู
export interface MenuItem {
  id: string;          // ID สำหรับเช็คสิทธิ์ (Unique)
  title: string;       // ชื่อที่แสดง
  icon?: any;          // ไอคอน (เฉพาะเมนูหลัก)
  href?: string;       // ลิงก์ปลายทาง
  submenu?: MenuItem[]; // เมนูย่อย (Recursive)
  isHeader?: boolean;
  roles?: string[];    // ✅ Role ที่เห็นเมนูนี้ (ถ้าไม่กำหนด = ทุก role เห็น)
}

/**
 * กรอง menu items ตาม role
 * ถ้า item.roles ไม่กำหนด → ทุก role เห็น
 * ถ้า item.roles กำหนดไว้ → เฉพาะ role ที่ระบุเท่านั้น
 */
export function filterMenuByRole(items: MenuItem[], userRole: string): MenuItem[] {
  return items
    .filter(item => {
      // ถ้าไม่กำหนด roles = ทุกคนเห็น
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.includes(userRole);
    })
    .map(item => {
      // กรอง submenu ด้วย (recursive)
      if (item.submenu && item.submenu.length > 0) {
        const filteredSubmenu = filterMenuByRole(item.submenu, userRole);
        // ถ้า submenu ถูกกรองหมด ให้ซ่อนเมนูหลักด้วย
        if (filteredSubmenu.length === 0) return null;
        return { ...item, submenu: filteredSubmenu };
      }
      return item;
    })
    .filter(Boolean) as MenuItem[];
}

// 2. ข้อมูลเมนูทั้งหมด (Master Data)
export const SIDEBAR_DATA: MenuItem[] = [
  // --- Module 1: Web Management (CMS) ---

  {
    id: 'header-web',
    title: 'หน้าเว็บ',
    isHeader: true,
    roles: ['admin', 'editor', 'web_editor'],
  },

  { id: 'web-home', title: 'จัดการหน้าแรก', href: '/backoffice/module/web/home', icon: <LayoutDashboard size={20} />, roles: ['admin', 'editor', 'web_editor'] },
  {
    id: 'web-about',
    title: 'เกี่ยวกับองค์กร',
    icon: <Building2 size={20} />,
    roles: ['admin', 'editor', 'web_editor'],
    submenu: [
      { id: 'web-about-history', title: 'ทำเนียบสภา', href: '/backoffice/module/web/about/history' },
      { id: 'web-about-board', title: 'กรรมการสภา', href: '/backoffice/module/web/about/council' },
    ]
  },
  { id: 'web-news', title: 'ข่าวประชาสัมพันธ์', href: '/backoffice/module/web/news', icon: <Megaphone size={20} />, roles: ['admin', 'editor', 'web_editor'] },
  { id: 'web-service', title: 'บริการ', href: '/backoffice/module/web/service', icon: <LayoutGrid size={20} />, roles: ['admin', 'editor', 'web_editor'] },

  { id: 'web-agency', title: 'หน่วยงาน', icon: <Landmark size={20} />, 
    roles: ['admin', 'editor', 'web_editor'],
    submenu: [
      { id: 'web-pharmacy', title: 'สำนักงานเลขาธิการ', href: '/backoffice/module/web/agency/pharmacy' },
      { id: 'web-royal-college', title: 'ราชวิทยาลัย', href: '/backoffice/module/web/agency/royal-college' },
      { id: 'web-supervised-organization', title: 'องค์กรในกำกับ', href: '/backoffice/module/web/agency/supervised-organization' },
    ]
  },

  {
    id: 'web-law',
    title: 'กฎหมาย',
    icon: <Scale size={20} />,
    roles: ['admin', 'editor', 'web_editor'],
    submenu: [
      { id: 'web-law-1', title: 'พระราชบัญญัติวิชาชีพเภสัชกรรม', href: '/backoffice/module/web/law/law1' },
      { id: 'web-law-2', title: 'ข้อบังคับสภาเภสัชกรรม', href: '/backoffice/module/web/law/law2' },
      { id: 'web-law-3', title: 'ประกาศสภาเภสัชกรรม', href: '/backoffice/module/web/law/law3' },
      { id: 'web-law-4', title: 'กฎกระทรวง', href: '/backoffice/module/web/law/law4' },
      { id: 'web-law-5', title: 'กฎหมายอื่นที่เกี่ยวข้อง', href: '/backoffice/module/web/law/law5' },
      { id: 'web-law-6', title: 'คำสั่งสภาเภสัชกรรม', href: '/backoffice/module/web/law/law6' },
      { id: 'web-law-7', title: 'ระเบียบสภาเภสัชกรรม', href: '/backoffice/module/web/law/law7' },
    ]
  },

  { id: 'web-setting', title: 'ตั้งค่าเว็บไซต์', href: '/backoffice/module/web/setting', icon: <Settings size={20} />, roles: ['admin','web_editor', 'editor'] },



  // --- Module 2: ทะเบียนเภสัช ---
  {
    id: 'header-pharmacy',
    title: 'ทะเบียนเภสัช',
    isHeader: true,
    roles: ['admin', 'editor', 'viewer'],
  },
  {
    id: 'module-pharmacy',
    title: 'ทะเบียนเภสัช',
    icon: <Pill size={20} />,
    href: '/backoffice/module/register',
    roles: ['admin', 'editor', 'viewer'],
  },


  {
    id: 'header-royalcollege',
    title: 'ราชวิทยาลัย',
    isHeader: true,
    roles : ['admin','editor'],
  },
  {
    id: 'module-royalcollege',
    title: 'จัดการราชวิทยาลัย',
    icon: <Book size={20} />,
    href: '/backoffice/module/royalcollege',
    roles: ['admin', 'editor'],
  },

  // --- Module อื่นๆ (Placeholder) ---
  {
    id: 'header-eservice',
    title: 'E-Service',
    isHeader: true,
    roles : ['admin','editor'],
  },
  {
    id: 'module-eservice',
    title: 'E-Service',
    icon: <Users size={20} />,
    href: "/backoffice/module/e-service",
    roles: ['admin', 'editor'],
  },


  {
    id: 'header-tran',
    title: 'การเงิน/ธุรกรรม',
    isHeader: true,
    roles : ['admin','editor'],
  },
  {
    id: 'module-tran',
    title: 'การเงิน/ธุรกรรม',
    icon: <FileText size={20} />,
    href: '/backoffice/module/bill',
    roles: ['admin', 'editor'],
  },


  {
    id: 'header-settings',
    title: 'การตั้งค่า',
    isHeader: true,
    roles: ['admin'],
  },
  {
    id: 'module-settings',
    title: 'ตั้งค่าระบบ',
    icon: <Settings size={20} />,
    href: '/backoffice/module/setting',
    roles: ['admin'],
  },

];