import { 
  LayoutDashboard, 
  Globe, 
  Pill, 
  FileText, 
  Users, 
  Settings, 
  Briefcase 
} from 'lucide-react';

// 1. กำหนด Type ของเมนู
export interface MenuItem {
  id: string;          // ID สำหรับเช็คสิทธิ์ (Unique)
  title: string;       // ชื่อที่แสดง
  icon?: any;          // ไอคอน (เฉพาะเมนูหลัก)
  href?: string;       // ลิงก์ปลายทาง
  submenu?: MenuItem[]; // เมนูย่อย (Recursive)
}

// 2. ข้อมูลเมนูทั้งหมด (Master Data)
export const SIDEBAR_DATA: MenuItem[] = [
  // --- Module 1: Web Management (CMS) ---
  {
    id: 'web-management',
    title: 'หน้าเว็บ',
    icon: <Globe size={20} />,
    submenu: [
      { id: 'web-home', title: '1. หน้าแรก', href: '/module/web/home' },
      { 
        id: 'web-about', 
        title: '2. เกี่ยวกับองค์กร',
        submenu: [
           { id: 'web-about-history', title: 'ประวัติความเป็นมา', href: '/admin/web/about/history' },
           { id: 'web-about-board', title: 'คณะกรรมการ', href: '/admin/web/about/board' },
        ]
      },
      { id: 'web-news', title: '3. ข่าวประชาสัมพันธ์', href: '/admin/web/news' },
      { id: 'web-service', title: '4. บริการ', href: '/admin/web/service' },
      { id: 'web-dept', title: '5. หน่วยงาน', href: '/admin/web/dept' },
      { 
        id: 'web-law', 
        title: '6. กฎหมาย',
        submenu: [
           { id: 'web-law-1', title: 'กฎหมายแพ่ง', href: '/admin/web/law/civil' },
           { id: 'web-law-2', title: 'กฎหมายอาญา', href: '/admin/web/law/criminal' },
           { id: 'web-law-3', title: 'พรบ.ยา', href: '/admin/web/law/drug-act' },
           { id: 'web-law-4', title: 'กฎกระทรวง', href: '/admin/web/law/ministerial' },
           { id: 'web-law-5', title: 'ประกาศสภา', href: '/admin/web/law/council' },
           { id: 'web-law-6', title: 'ระเบียบข้อบังคับ', href: '/admin/web/law/regulations' },
        ]
      },
    ]
  },

  // --- Module 2: ทะเบียนเภสัช ---
  {
    id: 'pharmacy-regis',
    title: 'ทะเบียนเภสัช',
    icon: <Pill size={20} />,
    href: '/module/register' 
  },

  // --- Module อื่นๆ (Placeholder) ---
  { 
    id: 'module-hr', 
    title: 'E-Service', 
    icon: <Users size={20} />,
    href:"/module/e-service"
  },
  { id: 'module-doc',
     title: 'การเงิน/ธุรกรรม', 
     icon: <FileText size={20} />, 
     href: '/module/bill' 
    },
 
  { id: 'module-settings', 
    title: 'ตั้งค่าระบบ', 
    icon: <Settings size={20} />, 
    href: '/module/setting'
 },
];