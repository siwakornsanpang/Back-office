// src/components/layout/Header.tsx
"use client";

import { Menu, LogOut } from 'lucide-react'; // เพิ่มไอคอน LogOut
import styles from './Header.module.css';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // 1. ลบ Cookie บัตรผ่านทิ้ง
    Cookies.remove('auth_token', { path: '/' });
    
    // 2. รีเฟรชเพื่อเคลียร์ State (ถ้ามี)
    router.refresh(); 
    
    // 3. ดีดกลับไปหน้า Login
    router.replace('/login');
  };

  return (
    <header className={styles.header}>
      
      {/* --- ฝั่งซ้าย: ปุ่ม Toggle + ชื่อแบรนด์ --- */}
      <div className={styles.leftSection}>
        <button className={styles.toggleBtn} title="Toggle Sidebar">
            <Menu size={20} />
        </button>
        <h1 className={styles.brandName}>BACKOFFICE</h1>
      </div>

      {/* (ลบช่อง Search ตรงกลางออกแล้ว) */}

      {/* --- ฝั่งขวา: ปุ่ม Logout (เดิมคือ Profile) --- */}
      <div className={styles.rightSection}>
        
        {/* เปลี่ยน div เป็น button หรือใส่ onClick เพื่อให้กดได้ */}
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