// src/components/layout/Header.tsx
"use client";

import { Menu, LogOut } from "lucide-react";
import styles from "./Header.module.css";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";

interface HeaderProps {
  onToggle: () => void;
  userName: string;
  userRole: string;
}

export default function Header({ onToggle, userName, userRole }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("auth_token", { path: "/" });
    Cookies.remove("user_role", { path: "/" });
    Cookies.remove("user_display_name", { path: "/" });
    Cookies.remove("user_id", { path: "/" });
    router.refresh();
    router.replace("/login");
  };

  // แปลง role เป็น badge สี
  const getRoleBadge = () => {
    switch (userRole) {
      case 'admin':
        return { label: 'Admin', color: '#ef4444', bg: '#fef2f2' };
      case 'editor':
        return { label: 'Editor', color: '#f59e0b', bg: '#fffbeb' };
      case 'web_editor':
        return { label: 'Web Editor', color: '#3b82f6', bg: '#eff6ff' };
      case 'viewer':
        return { label: 'Viewer', color: '#6b7280', bg: '#f9fafb' };
      default:
        return { label: userRole, color: '#6b7280', bg: '#f9fafb' };
    }
  };

  const badge = getRoleBadge();

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button
          className={styles.toggleBtn}
          title="Toggle Sidebar"
          onClick={onToggle}
        >
          <Menu size={20} />
        </button>
        <Link href="/backoffice" style={{ textDecoration: "none" }}>
          <h1 className={styles.brandName}>BACKOFFICE</h1>
        </Link>
      </div>

      <div className={styles.rightSection}>
        <div
          className={styles.userProfile}
          onClick={handleLogout}
          title="ออกจากระบบ"
        >
          <div className={styles.avatar}>{userName.charAt(0).toUpperCase()}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span 
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: badge.color,
                background: badge.bg,
                padding: '1px 8px',
                borderRadius: '9999px',
                border: `1px solid ${badge.color}20`,
              }}
            >
              {badge.label}
            </span>
          </div>
          <LogOut size={16} className={styles.logoutIcon} />
        </div>
      </div>
    </header>
  );
}
