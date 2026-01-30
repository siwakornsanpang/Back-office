// src/components/layout/Header.tsx
"use client";

import { Menu, Home, List } from 'lucide-react'; // ใช้ไอคอนจาก Lucide
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      
      {/* --- ฝั่งซ้าย: Logo + ปุ่ม Toggle --- */}
      <div className={styles.leftSection}>
        {/* ชื่อระบบ */}
        <div className={styles.brandBox}>
            <h1 className={styles.brandName}>BACKOFFICE</h1>
            
        </div>

        {/* ปุ่มเมนู (Hamburger) */}
        
      </div>

      {/* --- ฝั่งขวา: ไอคอน Home / List ---  ยังไม่มี */}
 

    </header>
  );
}