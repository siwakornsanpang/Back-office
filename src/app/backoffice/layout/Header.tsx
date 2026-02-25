// src/components/layout/Header.tsx
"use client";

import { Menu, LogOut } from "lucide-react";
import styles from "./Header.module.css";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import RoleBadge from "@/app/components/ui/RoleBadge";

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
            <RoleBadge role={userRole} size="sm" showIcon={false} />
          </div>
          <LogOut size={16} className={styles.logoutIcon} />
        </div>
      </div>
    </header>
  );
}
