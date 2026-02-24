// src/components/layout/Sidebar.tsx
"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import Cookies from 'js-cookie';
import { SIDEBAR_DATA, MenuItem, filterMenuByRole } from './menuConfig';
import styles from './Sidebar.module.css';

// Props
interface SidebarProps {
  isOpen: boolean;
  userRole: string;
  userName: string;
}

export default function Sidebar({ isOpen, userRole, userName }: SidebarProps) {
  const router = useRouter();

  // ✅ กรองเมนูตาม Role
  const visibleMenuItems = filterMenuByRole(SIDEBAR_DATA, userRole);

  const handleLogout = () => {
    Cookies.remove('auth_token', { path: '/' });
    Cookies.remove('user_role', { path: '/' });
    Cookies.remove('user_display_name', { path: '/' });
    Cookies.remove('user_id', { path: '/' });
    router.refresh();
    router.replace('/login');
  };

  return (
    <aside
      className={styles.sidebar}
      style={{
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        visibility: isOpen ? 'visible' : 'hidden'
      }}
    >
      <div className={styles.sidebarContent}>
        {visibleMenuItems.map((item) => (
          <SidebarItem key={item.id} item={item} level={0} />
        ))}
      </div>

      {/* Footer — แสดงข้อมูล User + Logout */}
      <div className={styles.sidebarFooter}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>{userName.charAt(0).toUpperCase()}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{userName}</div>
            <div className={styles.userRole}>{getRoleLabel(userRole)}</div>
          </div>
          <button 
            onClick={handleLogout} 
            className={styles.logoutBtn}
            title="ออกจากระบบ"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// แปลง role เป็นชื่อภาษาไทย
function getRoleLabel(role: string): string {
  switch (role) {
    case 'admin': return 'ผู้ดูแลระบบ';
    case 'editor': return 'ผู้แก้ไข';
    case 'web_editor': return 'ผู้จัดการเว็บ';
    case 'viewer': return 'ผู้ดู';
    default: return role;
  }
}

// Sub Component SidebarItem
function SidebarItem({ item, level }: { item: MenuItem; level: number }) {
  if (item.isHeader) {
    return <div className={styles.sectionHeader}>{item.title}</div>;
  }
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const hasChildren = item.submenu && item.submenu.length > 0;
  const isActive = item.href ? pathname === item.href : false;
  const paddingLeft = '12px';
  const handleClick = () => { if (hasChildren) setIsOpen(!isOpen); };

  const itemContent = (
    <div
      className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
      style={{ paddingLeft }}
      onClick={handleClick}
    >
      <div className={styles.labelContainer}>
        {item.icon && (
          <span className={`${styles.icon} ${isActive ? styles.iconActive : ''}`}>
            {item.icon}
          </span>
        )}
        <span className={styles.labelText}>{item.title}</span>
      </div>
      {hasChildren && (
        <span className={styles.chevron}>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      )}
    </div>
  );

  return (
    <div className={`${styles.itemWrapper} ${(hasChildren && isOpen) ? styles.expandedGroup : ''}`}>
      {hasChildren ? itemContent : <Link href={item.href || '#'}>{itemContent}</Link>}
      {hasChildren && isOpen && (
        <div className={styles.submenuContainer}>
          {item.submenu!.map((subItem) => (
            <SidebarItem key={subItem.id} item={subItem} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}