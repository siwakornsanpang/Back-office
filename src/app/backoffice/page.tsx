"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Users,
  Megaphone,
  PlusCircle,
  Search,
  FileCheck,
  TrendingUp,
  Loader2,
  Building2,
} from "lucide-react";
import styles from "./Dashboard.module.css";
import { authFetch } from "@/app/utils/authFetch";
import { getDefaultPage } from "@/app/config/roles";

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

type NewsItem = {
  id: number;
  title: string;
  category: string;
  status: string;
  createdAt: string;
};

type CouncilMember = {
  id: number;
  name: string;
  position: string;
  type: string;
};

const QUICK_ACTIONS = [
  {
    id: 1,
    label: "เพิ่มข่าวใหม่",
    href: "/backoffice/module/council-web/news",
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
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // เช็ค permission view_dashboard จาก API
  useEffect(() => {
    const checkPermission = async () => {
      const role = Cookies.get("user_role") || '';
      // admin ผ่านเสมอ
      if (role === 'admin') {
        setIsAuthorized(true);
        return;
      }

      try {
        const token = Cookies.get("auth_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const perms = await res.json();
          if (Array.isArray(perms) && perms.includes('view_dashboard')) {
            setIsAuthorized(true);
            return;
          }
        }
      } catch {}

      // ไม่มีสิทธิ์ → redirect ไปหน้าแรกของ role
      router.replace(getDefaultPage(Cookies.get("user_role") || ''));
    };

    checkPermission();
  }, [router]);

  // State for real data from API
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [councilMembers, setCouncilMembers] = useState<CouncilMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data from API
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        const [pharmacistRes, newsRes, councilRes] = await Promise.allSettled([
          authFetch(`${API_URL}/pharmacists`),
          authFetch(`${API_URL}/news`),
          authFetch(`${API_URL}/council`),
        ]);

        if (pharmacistRes.status === "fulfilled" && pharmacistRes.value.ok) {
          const data = await pharmacistRes.value.json();
          setPharmacists(data);
        }
        if (newsRes.status === "fulfilled" && newsRes.value.ok) {
          const data = await newsRes.value.json();
          setNewsList(data);
        }
        if (councilRes.status === "fulfilled" && councilRes.value.ok) {
          const data = await councilRes.value.json();
          setCouncilMembers(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    if (API_URL) {
      fetchAllData();
    } else {
      setIsLoading(false);
      setError("ยังไม่ได้ตั้งค่า API_URL");
    }
  }, [isAuthorized]);

  // ถ้ายังไม่รู้สิทธิ์ หรือกำลัง redirect → แสดงหน้าว่าง
  if (!isAuthorized) {
    return null;
  }

  // Calculate stats from real data
  const totalPharmacists = pharmacists.length;
  const activePharmacists = pharmacists.filter((p) => p.status === "ใช้งาน").length;
  const totalNews = newsList.length;
  const publishedNews = newsList.filter((n) => n.status === "published").length;
  const totalCouncil = councilMembers.length;

  const latestPharmacists = pharmacists.slice(0, 5).map((p) => {
    const cleanName = (p.name || "").trim();
    return { id: p.id, name: cleanName, license: p.registrationId || "-", province: p.province || "-" };
  });

  const latestNews = newsList.slice(0, 5).map((n) => {
    const date = n.createdAt ? new Date(n.createdAt) : null;
    const formattedDate = date
      ? date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })
      : "-";
    return { id: n.id, title: n.title, date: formattedDate };
  });

  const STATS_DATA = [
    { id: 1, title: "เภสัชกรทั้งหมด", value: isLoading ? "..." : totalPharmacists.toLocaleString(), change: `${activePharmacists} ใช้งาน`, icon: Users, iconClass: "iconBlue" },
    { id: 2, title: "ข่าวประชาสัมพันธ์", value: isLoading ? "..." : totalNews.toLocaleString(), change: `${publishedNews} เผยแพร่แล้ว`, icon: Megaphone, iconClass: "iconGreen" },
    { id: 3, title: "กรรมการสภา", value: isLoading ? "..." : totalCouncil.toLocaleString(), change: "คน", icon: Building2, iconClass: "iconPurple" },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSubtitle}>ภาพรวมระบบ Back-office สภาเภสัชกรรม</p>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#dc2626", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1rem" }}>
          ⚠️ {error}
        </div>
      )}

      <div className={styles.statsGrid}>
        {STATS_DATA.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.id} className={styles.statCard}>
              <div className={styles.statContent}>
                <h3>{stat.title}</h3>
                <p className={styles.statValue}>
                  {isLoading ? <Loader2 size={24} className={styles.spinner} /> : stat.value}
                </p>
                <span className={`${styles.statChange} ${styles.statChangeUp}`}>
                  <TrendingUp size={12} />
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

      <div className={styles.tablesGrid}>
        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <h3 className={styles.tableCardTitle}>📰 ข่าวล่าสุด</h3>
          </div>
          <div className={styles.tableCardBody}>
            {isLoading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ marginTop: "0.5rem" }}>กำลังโหลดข้อมูล...</p>
              </div>
            ) : latestNews.length > 0 ? (
              <>
                <table className={styles.dataTable}>
                  <thead><tr><th>หัวข้อ</th><th>วันที่</th></tr></thead>
                  <tbody>
                    {latestNews.map((news) => (
                      <tr key={news.id}>
                        <td className={styles.newsTitle}>{news.title}</td>
                        <td className={styles.newsDate}>{news.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Link href="/backoffice/module/council-web/news" className={styles.viewAllLink}>ดูทั้งหมด →</Link>
              </>
            ) : (
              <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>ไม่พบข้อมูลข่าว</div>
            )}
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <h3 className={styles.tableCardTitle}>👤 เภสัชกรลงทะเบียนใหม่</h3>
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
                  <thead><tr><th>ชื่อ</th><th>เลขที่</th><th>จังหวัด</th></tr></thead>
                  <tbody>
                    {latestPharmacists.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td><span className={styles.statusBadge}>{p.license}</span></td>
                        <td>{p.province}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Link href="/backoffice/module/register" className={styles.viewAllLink}>ดูทั้งหมด →</Link>
              </>
            ) : (
              <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>ไม่พบข้อมูลเภสัชกร</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
