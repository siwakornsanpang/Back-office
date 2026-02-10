"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Megaphone,
  DollarSign,
  Clock,
  PlusCircle,
  Search,
  FileCheck,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Edit,
  Trash2,
  LogIn,
  Loader2,
} from "lucide-react";
import styles from "./Dashboard.module.css";

// API URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
type Pharmacist = {
  id: string;
  name: string;
  registrationId: string;
  province: string;
  status: string;
};

// Mock Data สำหรับข้อมูลที่ยังไม่มี API
const MOCK_NEWS = [
  { id: 1, title: "ประกาศรายชื่อผู้สอบผ่านใบอนุญาต ครั้งที่ 1/2569", date: "9 ก.พ. 69" },
  { id: 2, title: "แจ้งเวียนประกาศสภาเภสัชกรรม เรื่อง หลักเกณฑ์การประกอบวิชาชีพ", date: "8 ก.พ. 69" },
  { id: 3, title: "กำหนดการประชุมใหญ่สามัญประจำปี 2569", date: "7 ก.พ. 69" },
  { id: 4, title: "รับสมัครเภสัชกรเข้าร่วมโครงการพัฒนาความรู้", date: "5 ก.พ. 69" },
  { id: 5, title: "ประชาสัมพันธ์หลักสูตรอบรมระยะสั้น", date: "3 ก.พ. 69" },
];

const RECENT_ACTIVITIES = [
  { id: 1, type: "add", text: "เพิ่มข่าวใหม่ โดย Admin", time: "5 นาทีที่แล้ว" },
  { id: 2, type: "edit", text: "แก้ไขข้อมูลเภสัชกร ภ.12458", time: "15 นาทีที่แล้ว" },
  { id: 3, type: "login", text: "เจ้าหน้าที่ทะเบียน เข้าสู่ระบบ", time: "30 นาทีที่แล้ว" },
  { id: 4, type: "add", text: "ลงทะเบียนเภสัชกรใหม่ 3 ราย", time: "1 ชั่วโมงที่แล้ว" },
  { id: 5, type: "delete", text: "ลบข่าวเก่า 2 รายการ", time: "2 ชั่วโมงที่แล้ว" },
];

const QUICK_ACTIONS = [
  {
    id: 1,
    label: "เพิ่มข่าวใหม่",
    href: "/backoffice/module/web/news",
    icon: PlusCircle,
    iconClass: "actionIconBlue",
  },
  {
    id: 2,
    label: "ตรวจสอบ E-Service",
    href: "/backoffice/module/e-service",
    icon: FileCheck,
    iconClass: "actionIconGreen",
  },
  {
    id: 3,
    label: "ค้นหาเภสัชกร",
    href: "/backoffice/module/register",
    icon: Search,
    iconClass: "actionIconPurple",
  },
];

export default function Dashboard() {
  // State for real data from API
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pharmacists data from API
  useEffect(() => {
    const fetchPharmacists = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/pharmacists`);
        if (!res.ok) throw new Error("Failed to fetch pharmacists");
        const data = await res.json();
        setPharmacists(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    if (API_URL) {
      fetchPharmacists();
    } else {
      setIsLoading(false);
      setError("ยังไม่ได้ตั้งค่า API_URL");
    }
  }, []);

  // Calculate stats from real data
  const totalPharmacists = pharmacists.length;
  const activePharmacists = pharmacists.filter((p) => p.status === "ใช้งาน").length;
  const uniqueProvinces = [...new Set(pharmacists.map((p) => p.province).filter(Boolean))].length;

  // Get latest 5 pharmacists for the table
  const latestPharmacists = pharmacists.slice(0, 5).map((p) => {
    const cleanName = (p.name || "").trim();
    return {
      id: p.id,
      name: cleanName,
      license: p.registrationId || "-",
      province: p.province || "-",
    };
  });

  // Calculate chart data (mock monthly registration data based on total)
  const baseValue = Math.floor(totalPharmacists / 100) || 100;
  const CHART_DATA = [
    { label: "ก.ย.", value: baseValue + Math.floor(Math.random() * 50) },
    { label: "ต.ค.", value: baseValue + Math.floor(Math.random() * 50) },
    { label: "พ.ย.", value: baseValue + Math.floor(Math.random() * 50) },
    { label: "ธ.ค.", value: baseValue + Math.floor(Math.random() * 50) },
    { label: "ม.ค.", value: baseValue + Math.floor(Math.random() * 50) },
    { label: "ก.พ.", value: baseValue + Math.floor(Math.random() * 50) },
  ];

  const maxChartValue = Math.max(...CHART_DATA.map((d) => d.value));

  // Stats Cards data
  const STATS_DATA = [
    {
      id: 1,
      title: "เภสัชกรทั้งหมด",
      value: isLoading ? "..." : totalPharmacists.toLocaleString(),
      change: `${activePharmacists} ใช้งาน`,
      changeType: "up" as const,
      icon: Users,
      iconClass: "iconBlue",
    },
    {
      id: 2,
      title: "ข่าวประชาสัมพันธ์",
      value: "156",
      change: "+3 วันนี้",
      changeType: "up" as const,
      icon: Megaphone,
      iconClass: "iconGreen",
    },
    {
      id: 3,
      title: "รายได้เดือนนี้",
      value: "฿850,000",
      change: "+12%",
      changeType: "up" as const,
      icon: DollarSign,
      iconClass: "iconOrange",
    },
    {
      id: 4,
      title: "จังหวัดที่มีเภสัชกร",
      value: isLoading ? "..." : uniqueProvinces.toString(),
      change: "จังหวัด",
      changeType: "up" as const,
      icon: Clock,
      iconClass: "iconPurple",
    },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSubtitle}>ภาพรวมระบบ Back-office สภาเภสัชกรรม</p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ 
          background: "#fee2e2", 
          color: "#dc2626", 
          padding: "1rem", 
          borderRadius: "0.5rem", 
          marginBottom: "1rem" 
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {STATS_DATA.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.id} className={styles.statCard}>
              <div className={styles.statContent}>
                <h3>{stat.title}</h3>
                <p className={styles.statValue}>
                  {isLoading && (stat.id === 1 || stat.id === 4) ? (
                    <Loader2 size={24} className={styles.spinner} />
                  ) : (
                    stat.value
                  )}
                </p>
                <span
                  className={`${styles.statChange} ${
                    stat.changeType === "up" ? styles.statChangeUp : styles.statChangeDown
                  }`}
                >
                  {stat.changeType === "up" ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  {stat.change}
                </span>
              </div>
              <div className={`${styles.statIcon} ${styles[stat.iconClass]}`}>
                <IconComponent size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActionsCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>ทางลัดด่วน</h2>
        </div>
        <div className={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link key={action.id} href={action.href} className={styles.actionButton}>
                <div className={`${styles.actionIcon} ${styles[action.iconClass]}`}>
                  <IconComponent size={20} />
                </div>
                <span className={styles.actionLabel}>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Bar Chart - สถิติเภสัชกรลงทะเบียน */}
        <div className={styles.chartCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📈 สถิติเภสัชกรลงทะเบียนใหม่</h2>
          </div>
          <div className={styles.simpleBarChart}>
            {CHART_DATA.map((item, index) => (
              <div key={index} className={styles.barItem}>
                <span className={styles.barValue}>{item.value}</span>
                <div
                  className={styles.bar}
                  style={{ height: `${(item.value / maxChartValue) * 150}px` }}
                />
                <span className={styles.barLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder for more charts */}
        <div className={styles.chartCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🍩 สัดส่วนสถานะใบอนุญาต</h2>
          </div>
          <div className={styles.chartPlaceholder}>
            <span>📊</span>
            <p>สามารถเพิ่ม Chart Library ภายหลัง</p>
            <p style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
              (เช่น Chart.js, Recharts)
            </p>
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className={styles.tablesGrid}>
        {/* Recent News (Mock) */}
        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <h3 className={styles.tableCardTitle}>📰 ข่าวล่าสุด</h3>
          </div>
          <div className={styles.tableCardBody}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>หัวข้อ</th>
                  <th>วันที่</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_NEWS.map((news) => (
                  <tr key={news.id}>
                    <td className={styles.newsTitle}>{news.title}</td>
                    <td className={styles.newsDate}>{news.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link href="/backoffice/module/web/news" className={styles.viewAllLink}>
              ดูทั้งหมด →
            </Link>
          </div>
        </div>

        {/* New Pharmacists (Real Data) */}
        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <h3 className={styles.tableCardTitle}>
              👤 เภสัชกรลงทะเบียนใหม่ 
              <span style={{ fontSize: "0.75rem", color: "#16a34a", marginLeft: "0.5rem" }}>
                (ข้อมูลจริง)
              </span>
            </h3>
          </div>
          <div className={styles.tableCardBody}>
            {isLoading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ marginTop: "0.5rem" }}>กำลังโหลดข้อมูล...</p>
              </div>
            ) : latestPharmacists.length > 0 ? (
              <>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>ชื่อ</th>
                      <th>เลขที่</th>
                      <th>จังหวัด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestPharmacists.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td>
                          <span className={styles.statusBadge}>{p.license}</span>
                        </td>
                        <td>{p.province}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Link href="/backoffice/module/register" className={styles.viewAllLink}>
                  ดูทั้งหมด →
                </Link>
              </>
            ) : (
              <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                ไม่พบข้อมูลเภสัชกร
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className={styles.activitiesCard}>
        <div className={styles.tableCardHeader}>
          <h3 className={styles.tableCardTitle}>🕐 กิจกรรมล่าสุด</h3>
        </div>
        <ul className={styles.activityList}>
          {RECENT_ACTIVITIES.map((activity) => {
            const iconMap: Record<string, { icon: React.ElementType; class: string }> = {
              add: { icon: UserPlus, class: styles.activityIconAdd },
              edit: { icon: Edit, class: styles.activityIconEdit },
              delete: { icon: Trash2, class: styles.activityIconDelete },
              login: { icon: LogIn, class: styles.activityIconLogin },
            };
            const { icon: ActivityIcon, class: iconClass } = iconMap[activity.type];

            return (
              <li key={activity.id} className={styles.activityItem}>
                <div className={`${styles.activityIcon} ${iconClass}`}>
                  <ActivityIcon size={14} />
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>{activity.text}</p>
                  <p className={styles.activityTime}>{activity.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
