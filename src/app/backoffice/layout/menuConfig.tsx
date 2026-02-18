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
}

// 2. ข้อมูลเมนูทั้งหมด (Master Data)
export const SIDEBAR_DATA: MenuItem[] = [
  // --- Module 1: Web Management (CMS) ---

  {
    id: 'header-web',
    title: 'หน้าเว็บ', // หรือจะใช้คำว่า "WEB MANAGEMENT" ให้เหมือนต้นแบบ
    isHeader: true     // 👈 บอกว่าเป็นหัวข้อ
  },



  { id: 'web-home', title: 'จัดการหน้าแรก', href: '/backoffice/module/web/home', icon: <LayoutDashboard size={20} />, },
  {
    id: 'web-about',
    title: 'เกี่ยวกับองค์กร',
    icon: <Building2 size={20} />,
    submenu: [
      { id: 'web-about-history', title: 'ทำเนียบสภา', href: '/backoffice/module/web/about/history' },
      { id: 'web-about-board', title: 'กรรมการสภา', href: '/backoffice/module/web/about/council' },
    ]
  },
  { id: 'web-news', title: 'ข่าวประชาสัมพันธ์', href: '/backoffice/module/web/news', icon: <Megaphone size={20} />, },
  { id: 'web-service', title: 'บริการ', href: '/backoffice/module/web/service', icon: <LayoutGrid size={20} /> },

  { id: 'web-agency', title: 'หน่วยงาน', icon: <Landmark size={20} />, 
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

  { id: 'web-setting', title: 'ตั้งค่าเว็บไซต์', href: '/backoffice/module/web/setting', icon: <Settings size={20} /> },



  // --- Module 2: ทะเบียนเภสัช ---
  {
    id: 'header-pharmacy',
    title: 'ทะเบียนเภสัช', // หรือจะใช้คำว่า "WEB MANAGEMENT" ให้เหมือนต้นแบบ
    isHeader: true     // 👈 บอกว่าเป็นหัวข้อ
  },
  {
    id: 'module-pharmacy',
    title: 'ทะเบียนเภสัช',
    icon: <Pill size={20} />,
    href: '/backoffice/module/register'
  },


  {
    id: 'header-royalcollege',
    title: 'ราชวิทยาลัย', // หรือจะใช้คำว่า "WEB MANAGEMENT" ให้เหมือนต้นแบบ
    isHeader: true     // 👈 บอกว่าเป็นหัวข้อ
  },
  {
    id: 'module-royalcollege',
    title: 'จัดการราชวิทยาลัย',
    icon: <Book size={20} />,
    href: '/backoffice/module/royalcollege'
  },

  // --- Module อื่นๆ (Placeholder) ---
  {
    id: 'header-eservice',
    title: 'E-Service', // หรือจะใช้คำว่า "WEB MANAGEMENT" ให้เหมือนต้นแบบ
    isHeader: true     // 👈 บอกว่าเป็นหัวข้อ
  },
  {
    id: 'module-eservice',
    title: 'E-Service',
    icon: <Users size={20} />,
    href: "/backoffice/module/e-service"
  },






  {
    id: 'header-tran',
    title: 'การเงิน/ธุรกรรม', // หรือจะใช้คำว่า "WEB MANAGEMENT" ให้เหมือนต้นแบบ
    isHeader: true     // 👈 บอกว่าเป็นหัวข้อ
  },
  {
    id: 'module-tran',
    title: 'การเงิน/ธุรกรรม',
    icon: <FileText size={20} />,
    href: '/backoffice/module/bill'
  },



  {
    id: 'header-settings',
    title: 'การตั้งค่า', // หรือจะใช้คำว่า "WEB MANAGEMENT" ให้เหมือนต้นแบบ
    isHeader: true     // 👈 บอกว่าเป็นหัวข้อ
  },
  {
    id: 'module-settings',
    title: 'ตั้งค่าระบบ',
    icon: <Settings size={20} />,
    href: '/backoffice/module/setting'
  },


];