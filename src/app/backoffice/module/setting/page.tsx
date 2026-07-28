"use client";

import React from "react";
import Link from "next/link";
import { Settings, Users, ShieldCheck, ChevronRight } from "lucide-react";
import styles from "../council-web/SubMenu.module.css";

const MENU_ITEMS = [
  {
    id: 1,
    title: "จัดการผู้ใช้",
    icon: Users,
    href: "/backoffice/module/setting/users",
  },
  {
    id: 2,
    title: "จัดการสิทธิ์",
    icon: ShieldCheck,
    href: "/backoffice/module/setting/permissions",
  },
];

export default function SettingMenuPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIconWrapper}>
          <Settings size={56} strokeWidth={1.5} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>ตั้งค่า</h1>
          <div className={styles.breadcrumb}>
            <Link href="/backoffice/module/council-web" className={styles.breadcrumbLink}>
              เว็บไซต์สภา
            </Link>
            <ChevronRight size={16} className={styles.breadcrumbSeparator} />
            <span>ตั้งค่า</span>
          </div>
        </div>
      </div>

      <div className={styles.menuGrid}>
        {MENU_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link key={item.id} href={item.href} className={styles.menuCard}>
              <div className={styles.iconCircle}>
                <IconComponent size={44} strokeWidth={1.5} />
              </div>
              <span className={styles.menuLabel}>{item.title}</span>
              <div className={styles.menuUnderline}></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}