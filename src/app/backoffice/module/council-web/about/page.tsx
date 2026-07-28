"use client";

import React from "react";
import Link from "next/link";
import { Landmark, Armchair, Users, Award, FileText, ChevronRight } from "lucide-react";
import styles from "../SubMenu.module.css";

const ABOUT_ITEMS = [
  {
    id: 1,
    title: "ทำเนียบสภา",
    description: "รายชื่อคณะกรรมการสภาเภสัชกรรม",
    icon: Armchair,
    href: "/backoffice/module/council-web/about/council",
  },
  {
    id: 2,
    title: "กรรมการสภา",
    description: "ข้อมูลคณะกรรมการสภาเภสัชกรรม",
    icon: Users,
    href: "/backoffice/module/council-web/about/history",
  },
  {
    id: 3,
    title: "เกียรติประวัติ",
    description: "เกียรติประวัติและรางวัลแห่งความภาคภูมิใจ",
    icon: Award,
    href: "/backoffice/module/council-web/about/honor",
  },
  {
    id: 4,
    title: "นโยบายสภา",
    description: "นโยบาย วิสัยทัศน์ และพันธกิจของสภาเภสัชกรรม",
    icon: FileText,
    href: "/backoffice/module/council-web/about/policy",
  },
];

export default function AboutOrgMenuPage() {
  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerIconWrapper}>
          <Landmark size={56} strokeWidth={1.5} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>เกี่ยวกับองค์กร</h1>
          <div className={styles.breadcrumb}>
            <Link href="/backoffice/module/council-web" className={styles.breadcrumbLink}>
              เว็บไซต์สภา
            </Link>
            <ChevronRight size={16} className={styles.breadcrumbSeparator} />
            <span>เกี่ยวกับองค์กร</span>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className={styles.menuGrid}>
        {ABOUT_ITEMS.map((item) => {
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
