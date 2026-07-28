"use client";

import React from "react";
import Link from "next/link";
import { Folder, BookOpen, Users, Monitor, ChevronRight } from "lucide-react";
import styles from "../SubMenu.module.css";

const SERVICE_ITEMS = [
  {
    id: 1,
    title: "ความรู้เรื่องยา",
    description: "แหล่งรวบรวมความรู้เกี่ยวกับยาและการใช้ยาอย่างปลอดภัย",
    icon: BookOpen,
    href: "/backoffice/module/council-web/service/medicine",
  },
  {
    id: 2,
    title: "โครงการของประชาชน",
    description: "โครงการและกิจกรรมเพื่อส่งเสริมสุขภาพของประชาชน",
    icon: Users,
    href: "/backoffice/module/council-web/service/public-project",
  },
  {
    id: 3,
    title: "E-service",
    description: "บริการออนไลน์สำหรับประชาชนและเภสัชกร",
    icon: Monitor,
    href: "/backoffice/module/council-web/service/e-service",
  },
];

export default function ServiceMenuPage() {
  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerIconWrapper}>
          <Folder size={56} strokeWidth={1.5} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>บริการ</h1>
          <div className={styles.breadcrumb}>
            <Link href="/backoffice/module/council-web" className={styles.breadcrumbLink}>
              เว็บไซต์สภา
            </Link>
            <ChevronRight size={16} className={styles.breadcrumbSeparator} />
            <span>บริการ</span>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className={styles.menuGrid}>
        {SERVICE_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link key={item.id} href={item.href} className={styles.menuCard}>
              <div className={styles.iconCircle}>
                <IconComponent size={44} strokeWidth={1.5} />
              </div>
              <span className={styles.menuLabel}>{item.title}</span>
              <div className={styles.menuUnderline}></div>
              <p className={styles.menuDescription}>{item.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
