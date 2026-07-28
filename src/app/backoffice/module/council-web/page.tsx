"use client";

import React from "react";
import Link from "next/link";
import {
  Globe,
  LayoutGrid,
  Landmark,
  Megaphone,
  Folder,
  Users,
  Scale,
  Briefcase,
  Settings,
} from "lucide-react";
import styles from "./CouncilMenu.module.css";

const MENU_ITEMS = [
  { id: 1, label: "จัดการหน้าแรก", icon: LayoutGrid, href: "/backoffice/module/council-web/home" },
  { id: 2, label: "เกี่ยวกับองค์กร", icon: Landmark, href: "/backoffice/module/council-web/about" },
  { id: 3, label: "ข่าวประชาสัมพันธ์", icon: Megaphone, href: "/backoffice/module/council-web/news" },
  { id: 4, label: "บริการ", icon: Folder, href: "/backoffice/module/council-web/service" },
  { id: 5, label: "หน่วยงาน", icon: Users, href: "/backoffice/module/council-web/agency" },
  { id: 6, label: "กฎหมาย", icon: Scale, href: "/backoffice/module/council-web/law" },
  { id: 7, label: "บริการอื่น ๆ", icon: Briefcase, href: "/backoffice/module/council-web/other-service" },
  { id: 8, label: "ตั้งค่าเว็บไซต์", icon: Settings, href: "/backoffice/module/council-web/setting" },
];

export default function CouncilWebMenu() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.globeIconWrapper}>
          <Globe size={56} strokeWidth={1.5} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>เว็บไซต์สภา</h1>
          <p className={styles.subtitle}>เลือกเมนูที่ต้องการจัดการ</p>
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
              <span className={styles.menuLabel}>{item.label}</span>
              <div className={styles.menuUnderline}></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
