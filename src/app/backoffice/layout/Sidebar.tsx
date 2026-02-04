// src/components/layout/Sidebar.tsx
"use client";

import { useState } from 'react';
import { usePathname ,useRouter} from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight, LogOut} from 'lucide-react';
import Cookies from 'js-cookie'; 
import { SIDEBAR_DATA, MenuItem } from './menuConfig'; // เช็ค path ให้ถูก
import styles from './Sidebar.module.css';

// 1. รับ Props isOpen
interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const router = useRouter();
  const visibleMenuItems = SIDEBAR_DATA; 

  const handleLogout = () => {
    Cookies.remove('auth_token', { path: '/' });
    router.refresh();
    router.replace('/login');
  };

  return (
    <aside 
      className={styles.sidebar}
      // 2. ใส่ Inline Style เพื่อควบคุมการเลื่อนเข้า-ออก
      style={{
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', // ถ้าปิด ให้เลื่อนไปทางซ้ายจนพ้นจอ
        transition: 'transform 0.3s ease-in-out', // ใส่ Animation ให้นุ่มนวล
        visibility: isOpen ? 'visible' : 'hidden' // กันไม่ให้กดโดนตอนซ่อน
      }}
    >
      <div className={styles.sidebarContent}>
        {visibleMenuItems.map((item) => (
           <SidebarItem key={item.id} item={item} level={0} />
        ))}
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>A</div> 
          <div className={styles.userInfo}>
            <div className={styles.userName}>Admin</div>
            <div className={styles.userRole}>Admin Test</div>
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

// ... (Sub Component SidebarItem ใช้โค้ดเดิมได้เลย ไม่ต้องแก้) ...
function SidebarItem({ item, level }: { item: MenuItem; level: number }) {
    // (ใส่โค้ด SidebarItem เดิมของคุณตรงนี้...)
    // ...
    // เพื่อความกระชับ ผมละไว้ในฐานที่เข้าใจนะครับ 
    // ให้คงโค้ดเดิมส่วนล่างนี้ไว้ทั้งหมดครับ
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
        className={`${styles.menuItem} ${isActive ? styles.active : '' }`}
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