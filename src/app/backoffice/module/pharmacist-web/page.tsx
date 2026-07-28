"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, LayoutGrid, ShoppingBag } from "lucide-react";
import styles from "../council-web/CouncilMenu.module.css";

const MENU_ITEMS = [
  {
    id: 1,
    label: "จัดการหน้าแรก",
    icon: LayoutGrid,
    href: "/backoffice/module/pharmacist-web/home",
  },
  {
    id: 2,
    label: "สินค้าสภา",
    icon: ShoppingBag,
    href: "/backoffice/module/pharmacist-web/product",
  },
];

export default function PharmacistWebMenuPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.globeIconWrapper}>
          <BookOpen size={56} strokeWidth={1.5} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>เว็บไซต์เภสัชกร</h1>
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
