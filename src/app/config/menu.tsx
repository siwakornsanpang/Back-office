import {
  Globe,
  BookOpen,
  IdCard,
  GraduationCap,
  Monitor,
  CreditCard,
  Settings,
  LayoutGrid,
  Landmark,
  Megaphone,
  Folder,
  Users,
  Scale,
  Briefcase,
  ShoppingBag,
  ShieldCheck,
  Armchair,
  Award,
  FileText,
} from 'lucide-react';
import type { ReactNode } from 'react';

// ============================================
// Menu Config — Big modules + submenus
// ============================================

export interface MenuItem {
  id: string;
  title: string;
  icon?: ReactNode;
  href?: string;
  submenu?: MenuItem[];
  isHeader?: boolean;
  permission?: string;
}

export type BigModuleId =
  | 'council-web'
  | 'pharmacist-web'
  | 'register'
  | 'royalcollege'
  | 'e-service'
  | 'bill'
  | 'setting';

export interface BigModule {
  id: BigModuleId;
  title: string;
  icon: ReactNode;
  href: string;
  pathPrefix: string;
  permission?: string;
}

export function filterMenuByPermission(items: MenuItem[], userPermissions: string[]): MenuItem[] {
  return items
    .filter((item) => {
      if (!item.permission) return true;
      return userPermissions.includes(item.permission);
    })
    .map((item) => {
      if (item.submenu && item.submenu.length > 0) {
        const filteredSubmenu = filterMenuByPermission(item.submenu, userPermissions);
        if (filteredSubmenu.length === 0) return null;
        return { ...item, submenu: filteredSubmenu };
      }
      return item;
    })
    .filter(Boolean) as MenuItem[];
}

/** Module ใหญ่ — หน้า hub */
export const BIG_MODULES: BigModule[] = [
  {
    id: 'council-web',
    title: 'เว็บไซต์สภา',
    icon: <Globe size={36} strokeWidth={1.6} />,
    href: '/backoffice/module/council-web/home',
    pathPrefix: '/backoffice/module/council-web',
    permission: 'manage_home',
  },
  {
    id: 'pharmacist-web',
    title: 'เว็บไซต์เภสัชกร',
    icon: <BookOpen size={36} strokeWidth={1.6} />,
    href: '/backoffice/module/pharmacist-web/home',
    pathPrefix: '/backoffice/module/pharmacist-web',
    permission: 'manage_web_pharmacist',
  },
  {
    id: 'register',
    title: 'ทะเบียนเภสัช',
    icon: <IdCard size={36} strokeWidth={1.6} />,
    href: '/backoffice/module/register/list',
    pathPrefix: '/backoffice/module/register',
    permission: 'manage_register',
  },
  {
    id: 'royalcollege',
    title: 'ราชวิทยาลัย',
    icon: <GraduationCap size={36} strokeWidth={1.6} />,
    href: '/backoffice/module/royalcollege/management',
    pathPrefix: '/backoffice/module/royalcollege',
    permission: 'manage_royalcollege',
  },
  {
    id: 'e-service',
    title: 'E-Service',
    icon: <Monitor size={36} strokeWidth={1.6} />,
    href: '/backoffice/module/e-service/services',
    pathPrefix: '/backoffice/module/e-service',
    permission: 'manage_eservice',
  },
  {
    id: 'bill',
    title: 'การเงิน / ธุรกรรม',
    icon: <CreditCard size={36} strokeWidth={1.6} />,
    href: '/backoffice/module/bill/transactions',
    pathPrefix: '/backoffice/module/bill',
    permission: 'manage_tran',
  },
  {
    id: 'setting',
    title: 'ตั้งค่า',
    icon: <Settings size={36} strokeWidth={1.6} />,
    href: '/backoffice/module/setting/users',
    pathPrefix: '/backoffice/module/setting',
    permission: 'manage_users',
  },
];

/** Module ย่อย — ใช้ใน sidebar ตาม module ใหญ่ที่เลือก */
export const MODULE_SUBMENUS: Record<BigModuleId, MenuItem[]> = {
  'council-web': [
    {
      id: 'cw-home',
      title: 'จัดการหน้าแรก',
      icon: <LayoutGrid size={18} />,
      href: '/backoffice/module/council-web/home',
      permission: 'manage_home',
    },
    {
      id: 'cw-about',
      title: 'เกี่ยวกับองค์กร',
      icon: <Landmark size={18} />,
      href: '/backoffice/module/council-web/about/council',
      permission: 'manage_home',
      submenu: [
        {
          id: 'cw-about-council',
          title: 'ทำเนียบสภา',
          icon: <Armchair size={16} />,
          href: '/backoffice/module/council-web/about/council',
          permission: 'manage_home',
        },
        {
          id: 'cw-about-history',
          title: 'กรรมการสภา',
          icon: <Users size={16} />,
          href: '/backoffice/module/council-web/about/history',
          permission: 'manage_home',
        },
        {
          id: 'cw-about-honor',
          title: 'เกียรติประวัติ',
          icon: <Award size={16} />,
          href: '/backoffice/module/council-web/about/honor',
          permission: 'manage_home',
        },
        {
          id: 'cw-about-policy',
          title: 'นโยบายสภา',
          icon: <FileText size={16} />,
          href: '/backoffice/module/council-web/about/policy',
          permission: 'manage_home',
        },
      ],
    },
    {
      id: 'cw-news',
      title: 'ข่าวประชาสัมพันธ์',
      icon: <Megaphone size={18} />,
      href: '/backoffice/module/council-web/news',
      permission: 'manage_home',
    },
    {
      id: 'cw-service',
      title: 'บริการ',
      icon: <Folder size={18} />,
      href: '/backoffice/module/council-web/service/medicine',
      permission: 'manage_home',
      submenu: [
        {
          id: 'cw-svc-medicine',
          title: 'ความรู้เรื่องยา',
          icon: <BookOpen size={16} />,
          href: '/backoffice/module/council-web/service/medicine',
          permission: 'manage_home',
        },
        {
          id: 'cw-svc-public',
          title: 'โครงการของประชาชน',
          icon: <Users size={16} />,
          href: '/backoffice/module/council-web/service/public-project',
          permission: 'manage_home',
        },
        {
          id: 'cw-svc-eservice',
          title: 'E-service',
          icon: <Monitor size={16} />,
          href: '/backoffice/module/council-web/service/e-service',
          permission: 'manage_home',
        },
      ],
    },
    {
      id: 'cw-agency',
      title: 'หน่วยงาน',
      icon: <Users size={18} />,
      href: '/backoffice/module/council-web/agency',
      permission: 'manage_home',
    },
    {
      id: 'cw-law',
      title: 'กฎหมาย',
      icon: <Scale size={18} />,
      href: '/backoffice/module/council-web/law',
      permission: 'manage_home',
    },
    {
      id: 'cw-other',
      title: 'บริการอื่นๆ',
      icon: <Briefcase size={18} />,
      href: '/backoffice/module/council-web/other-service',
      permission: 'manage_home',
    },
    {
      id: 'cw-setting',
      title: 'ตั้งค่าเว็บไซต์',
      icon: <Settings size={18} />,
      href: '/backoffice/module/council-web/setting',
      permission: 'manage_home',
    },
  ],
  'pharmacist-web': [
    {
      id: 'pw-home',
      title: 'จัดการหน้าแรก',
      icon: <LayoutGrid size={18} />,
      href: '/backoffice/module/pharmacist-web/home',
      permission: 'manage_web_pharmacist',
    },
    {
      id: 'pw-product',
      title: 'สินค้าสภา',
      icon: <ShoppingBag size={18} />,
      href: '/backoffice/module/pharmacist-web/product',
      permission: 'manage_web_pharmacist',
    },
  ],
  register: [
    {
      id: 'reg-list',
      title: 'ทะเบียนเภสัช',
      icon: <IdCard size={18} />,
      href: '/backoffice/module/register/list',
      permission: 'manage_register',
    },
  ],
  royalcollege: [
    {
      id: 'rc-mgmt',
      title: 'จัดการราชวิทยาลัย',
      icon: <GraduationCap size={18} />,
      href: '/backoffice/module/royalcollege/management',
      permission: 'manage_royalcollege',
    },
  ],
  'e-service': [
    {
      id: 'es-services',
      title: 'E-Service',
      icon: <Monitor size={18} />,
      href: '/backoffice/module/e-service/services',
      permission: 'manage_eservice',
    },
  ],
  bill: [
    {
      id: 'bill-tx',
      title: 'การเงิน / ธุรกรรม',
      icon: <CreditCard size={18} />,
      href: '/backoffice/module/bill/transactions',
      permission: 'manage_tran',
    },
  ],
  setting: [
    {
      id: 'set-users',
      title: 'จัดการผู้ใช้',
      icon: <Users size={18} />,
      href: '/backoffice/module/setting/users',
      permission: 'manage_users',
    },
    {
      id: 'set-perms',
      title: 'จัดการสิทธิ์',
      icon: <ShieldCheck size={18} />,
      href: '/backoffice/module/setting/permissions',
      permission: 'manage_users',
    },
  ],
};

/** หา module ใหญ่จาก pathname */
export function getActiveBigModule(pathname: string): BigModule | null {
  const sorted = [...BIG_MODULES].sort(
    (a, b) => b.pathPrefix.length - a.pathPrefix.length
  );
  return sorted.find((m) => pathname === m.pathPrefix || pathname.startsWith(m.pathPrefix + '/')) ?? null;
}

export function isBackofficeHub(pathname: string): boolean {
  return pathname === '/backoffice' || pathname === '/backoffice/';
}

/** เดิม sidebar แสดง module ใหญ่ — เก็บไว้เผื่อ fallback */
export const SIDEBAR_DATA: MenuItem[] = BIG_MODULES.map((m) => ({
  id: `${m.id}-hub`,
  title: m.title,
  href: m.href,
  icon: m.icon,
  permission: m.permission,
}));
