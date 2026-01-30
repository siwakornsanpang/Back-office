"use client";

import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SIDEBAR_DATA, MenuItem } from './menuConfig';
import styles from './Sidebar.module.css';

// --- Helper Function: กรองเมนูตาม Permission ---
function filterMenuByPermission(items: MenuItem[], allowedIds: string[]): MenuItem[] {
  return items.reduce((acc: MenuItem[], item) => {
    // 1. กรองลูกก่อน (Recursive)
    let filteredChildren: MenuItem[] = [];
    if (item.submenu) {
      filteredChildren = filterMenuByPermission(item.submenu, allowedIds);
    }

    // 2. เช็คเงื่อนไข
    const isExplicitlyAllowed = allowedIds.includes(item.id); // ตัวมันเองได้รับอนุญาต
    const hasAllowedChildren = filteredChildren.length > 0;   // หรือลูกมันได้รับอนุญาต

    // ถ้าผ่านเงื่อนไขใดเงื่อนไขหนึ่ง
    if (isExplicitlyAllowed || hasAllowedChildren) {
      const newItem = { ...item };
      // อัปเดตลูกด้วยรายการที่กรองแล้ว
      if (item.submenu) {
        newItem.submenu = filteredChildren;
      }
      acc.push(newItem);
    }

    return acc;
  }, []);
}

// =========================================================
// Main Component
// =========================================================
export default function Sidebar() {


  
  // 🔥 MOCK DATA: จำลองสิทธิ์ User (ตรงนี้อนาคตดึงมาจาก DB/Login Session)
  // ตัวอย่าง: User นี้เห็น Web Management ได้ แต่เจาะจงเห็นแค่ "กฎหมาย" เท่านั้น
  {/*}
  const myAllowedIds = [
    'web-management', // ต้องให้สิทธิ์ตัวแม่ด้วย
    'web-law',        // ให้สิทธิ์กลุ่มกฎหมาย
    'web-law-1',      // กฎหมายย่อย 1
    'web-law-2',      // กฎหมายย่อย 2
    'web-law-3',      
    
 
  ]; 
  */
 }
 const visibleMenuItems = SIDEBAR_DATA;

  // คำนวณเมนูที่จะแสดง (Memoize ไว้จะได้ไม่คำนวณใหม่ทุกครั้งที่ render)
  {/*
  const visibleMenuItems = useMemo(() => {
    return filterMenuByPermission(SIDEBAR_DATA, myAllowedIds);
  }, [myAllowedIds]);
  */}
  return (
    <aside className={styles.sidebar}>
      <div className="p-4">

        
        <div className="flex flex-col gap-1">
          {visibleMenuItems.map((item) => (
             <SidebarItem key={item.id} item={item} level={0} />
          ))}

          {visibleMenuItems.length === 0 && (
            <div className={styles.noPermission}>
              ไม่มีสิทธิ์เข้าถึงเมนู
            </div>
          )}
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
  const isActive = item.href ? pathname === item.href : false;

  // คำนวณ padding ซ้าย (Inline style เพราะเป็นค่าคำนวณ)
  const paddingLeft = level === 0 ? '12px' : `${(level * 16) + 12}px`;

  const handleClick = () => {
    if (hasChildren) setIsOpen(!isOpen);
  };

  // เลือก Class ตามสถานะ (Active หรือ Inactive)
  const stateClass = isActive ? styles.active : styles.inactive;
  // เลือก Class ตาม Level
  const levelClass = level === 0 ? styles.level0 : styles.levelDeep;

  // UI ของปุ่มเมนู
  const content = (
    <div 
      className={`${styles.menuItem} ${stateClass} ${levelClass}`}
      style={{ paddingLeft }}
      onClick={handleClick}
    >
      <div className={styles.labelContainer}>
        {/* Icon (Level 0) */}
        {level === 0 && item.icon && (
            <span className={styles.icon}>{item.icon}</span>
        )}
        
        {/* Bullet (Level > 0) */}
        {level > 0 && (
            <span className={styles.bullet}></span>
        )}
        
        <span className={styles.labelText}>{item.title}</span>
      </div>

      {/* ลูกศร */}
      {hasChildren && (
        <span className={styles.chevron}>
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      )}
    </div>
  );

  return (
    <div>
      {/* 1. ส่วนหัว */}
      {hasChildren ? content : <Link href={item.href || '#'}>{content}</Link>}

      {/* 2. ส่วนลูก */}
      {hasChildren && isOpen && (
        <div className={styles.submenuWrapper}>
          {item.submenu!.map((subItem) => (
            <SidebarItem key={subItem.id} item={subItem} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
  
}