// src/components/layout/Header.tsx
"use client";

import { Menu, LogOut } from 'lucide-react';
import styles from './Header.module.css';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// 1. กำหนด Type ของ Props ที่จะรับมา
interface HeaderProps {
  onToggle: () => void;
}

// 2. รับ onToggle เข้ามาใน Component
export default function Header({ onToggle }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('auth_token', { path: '/' });
    router.refresh(); 
    router.replace('/login');
  };

  return (
    <header className={styles.header}>
      
      <div className={styles.leftSection}>
        {/* 3. ผูกฟังก์ชัน onToggle กับปุ่ม Menu */}
        <button 
          className={styles.toggleBtn} 
          title="Toggle Sidebar"
          onClick={onToggle} // 👈 ใส่ตรงนี้
        >
            <Menu size={20} />
        </button>
        <h1 className={styles.brandName}>BACKOFFICE</h1>
      </div>

      <div className={styles.rightSection}>
        <div 
            className={styles.userProfile} 
            onClick={handleLogout}
            title="ออกจากระบบ"
        >
            <div className={styles.avatar}>A</div>
            <div className={styles.userInfo}>
                <span className={styles.userName}>Admin</span>
                <span className={styles.userRole}>Click to Logout</span>
            </div>
            <LogOut size={16} className={styles.logoutIcon} />
        </div>
      </div>

    </header>
  );
}