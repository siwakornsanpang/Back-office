"use client";

import { useState } from 'react';
import { usePathname ,useRouter} from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Circle ,LogOut} from 'lucide-react';
import Cookies from 'js-cookie'; 
import { SIDEBAR_DATA, MenuItem } from './menuConfig';
import styles from './Sidebar.module.css';

// ... (เก็บ function filterMenuByPermission ไว้เหมือนเดิม) ...

export default function Sidebar() {
  // 🔥 ใช้ Logic เดิมของคุณ (Permission)
  const router = useRouter();
  const visibleMenuItems = SIDEBAR_DATA; 

  const handleLogout = () => {
    // 1. ลบ Cookie บัตรผ่านทิ้ง
    Cookies.remove('auth_token', { path: '/' });
    router.refresh(); // ระบุ path ให้ชัวร์
    
    // 2. ดีดกลับไปหน้า Login
    
    router.replace('/login');
  };


  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        {visibleMenuItems.map((item) => (
           <SidebarItem key={item.id} item={item} level={0} />
        ))}
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.userProfile}>
          
          {/* Avatar (ใส่ตัวอักษรย่อ หรือรูปภาพจริง) */}
          <div className={styles.avatar}>A</div> 
          
          {/* ข้อมูล User */}
          <div className={styles.userInfo}>
            <div className={styles.userName}>Admin</div>
            <div className={styles.userRole}>Admin Test</div>
          </div>

          {/* ปุ่ม Logout */}
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

// =========================================================
// Sub Component
// =========================================================
function SidebarItem({ item, level }: { item: MenuItem; level: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); 

  const hasChildren = item.submenu && item.submenu.length > 0;
  // เช็คว่า URL ปัจจุบัน ตรงกับเมนูนี้ หรือ เป็นลูกหลานของเมนูนี้ไหม
  const isActive = item.href ? pathname === item.href : false;
  
  // ✅ ปรับสูตรคำนวณระยะห่างใหม่ (ลดจาก 16 เหลือ 10 หรือ 8)
  // Level 0 = 12px
  // Level 1+ = ขยับทีละ 10px พอ (ประหยัดที่)
  const paddingLeft = level === 0 ? '16px' : `${(level * 10) + 16}px`;

  const handleClick = () => {
    if (hasChildren) setIsOpen(!isOpen);
  };

  const itemContent = (
    <div 
      className={`${styles.menuItem} ${isActive ? styles.active : '' }`}
      style={{ paddingLeft }}
      onClick={handleClick}
    >
      <div className={styles.labelContainer}>
        {/* Icon: Level 0 โชว์ Icon ใหญ่, Level ลึกๆ โชว์จุดเล็กๆ หรือไม่โชว์เลย */}
        {item.icon ? (
           <span className={`${styles.icon} ${isActive ? styles.iconActive : ''}`}>
            {item.icon}
           </span>
        ) : (
           // ถ้าไม่มี icon ให้ใส่จุดเล็กๆ แทน เพื่อให้แนวตัวหนังสือตรงกัน
           <span className={styles.bulletIcon}>
             <Circle size={6} fill="currentColor" />
           </span>
        )}
        
        <span className={styles.labelText}>{item.title}</span>
      </div>

      {/* ลูกศร (ขยับไปขวาสุด) */}
      {hasChildren && (
        <span className={styles.chevron}>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      )}
    </div>
  );

  return (
    <div className={styles.itemWrapper}>
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