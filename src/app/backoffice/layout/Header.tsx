// src/components/layout/Header.tsx
"use client";

import React, { useState } from "react";
import { Menu, User, ChevronDown, Search } from "lucide-react";
import styles from "./Header.module.css";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onToggle: () => void;
  userName: string;
  userRole: string;
}

export default function Header({ onToggle, userName, userRole }: HeaderProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    Cookies.remove("auth_token", { path: "/" });
    Cookies.remove("user_role", { path: "/" });
    Cookies.remove("user_display_name", { path: "/" });
    Cookies.remove("user_id", { path: "/" });
    router.refresh();
    router.replace("/login");
  };

  return (
    <header className={styles.header}>
      {/* ฝั่งซ้าย — ปุ่ม Toggle + โลโก้สภา */}
      <div className={styles.leftSection}>
        <button
          className={styles.toggleBtn}
          title="Toggle Sidebar"
          onClick={onToggle}
        >
          <Menu size={26} color="white" />
        </button>
        <Link href="/backoffice" className={styles.brandContainer} style={{ textDecoration: 'none' }}>
          <img src="/favicon.ico" alt="Logo" className={styles.logoImage} />
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>สภาเภสัชกรรม</span>
            <span className={styles.brandSubtitle}>Backoffice</span>
          </div>
        </Link>
      </div>

      {/* ฝั่งขวา — โปรไฟล์ผู้ดูแลระบบ */}
      <div className={styles.rightSection}>
        <div className={styles.searchBox}>
          <Search size={15} />
          <input
            aria-label="ค้นหาเมนู รายการ หรือผู้ใช้งาน"
            placeholder="ค้นหาเมนู, รายการ, ผู้ใช้งาน..."
          />
        </div>
        <div
          className={styles.userProfile}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          title="โปรไฟล์ผู้ใช้งาน"
        >
          <div className={styles.avatar}>
            <User size={20} />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {userRole?.toLowerCase() === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
            </span>
            <span className={styles.userRole}>
              {userName && userName !== 'User' && userName !== 'ผู้ดูแลระบบ' ? userName : 'Administrator'}
            </span>
          </div>
          <ChevronDown size={16} className={styles.chevronIcon} />

          {/* เมนูดรอปดาวน์ Logout */}
          {showProfileMenu && (
            <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
              <button className={styles.dropdownItem} onClick={handleLogout}>
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
