// src/components/layout/Sidebar.tsx
"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight, LogOut, User } from 'lucide-react';
import Cookies from 'js-cookie';
import { SIDEBAR_DATA, MenuItem, filterMenuByPermission } from '@/app/config/menu';
import styles from './Sidebar.module.css';
import { authFetch } from '@/app/utils/authFetch';
import { SkeletonMenu } from '@/app/components/ui/Skeleton';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Props
interface SidebarProps {
  isOpen: boolean;
  userRole: string;
  userName: string;
}

export default function Sidebar({ isOpen, userRole, userName }: SidebarProps) {
  const router = useRouter();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // ดึง permissions ของ user จาก API
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await authFetch(`${API_URL}/permissions/my`);
        if (res.ok) {
          const data = await res.json();
          setUserPermissions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch permissions:', err);
      } finally {
        setPermissionsLoaded(true);
      }
    };

    fetchPermissions();
  }, [userRole]);

  // ✅ กรองเมนูตาม permissions จาก DB (ไม่ใช่ hardcode อีกต่อไป)
  const visibleMenuItems = filterMenuByPermission(SIDEBAR_DATA, userPermissions);

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
        {!permissionsLoaded ? (
          <SkeletonMenu rows={7} />
        ) : (
          visibleMenuItems.map((item) => (
            <SidebarItem key={item.id} item={item} level={0} />
          ))
        )}
      </div>

      {/* Footer — แสดงข้อมูล User + Logout */}
      <div className={styles.sidebarFooter}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            <User size={22} strokeWidth={2} />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {userName && userName !== 'User' && userName !== 'ผู้ดูแลระบบ' ? userName : 'Administrator'}
            </span>
            <span className={styles.userRole}>
              {userRole?.toLowerCase() === 'admin' ? 'ผู้ดูแลระบบ' : userRole?.toLowerCase() === 'editor' ? 'ผู้แก้ไขข้อมูล' : 'ผู้ดูแลระบบ'}
            </span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="ออกจากระบบ">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}



// Sub Component SidebarItem
function SidebarItem({ item, level }: { item: MenuItem; level: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (item.isHeader) {
    return <div className={styles.sectionHeader}>{item.title}</div>;
  }

  const hasChildren = item.submenu && item.submenu.length > 0;
  const isActive = item.href ? pathname === item.href : false;
  const paddingLeft = '12px';
  const handleClick = () => { if (hasChildren) setIsOpen(!isOpen); };

  const itemContent = (
    <div
      className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
      style={{ paddingLeft }}
      onClick={handleClick}
      title={item.title}
    >
      <div className={styles.labelContainer}>
        {item.icon && (
          <span className={`${styles.icon} ${isActive ? styles.iconActive : ''}`}>
            {item.icon}
          </span>
        )}
        <span className={styles.labelText}>{item.title}</span>
      </div>
      <span className={styles.chevron}>
        {hasChildren && isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </span>
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
