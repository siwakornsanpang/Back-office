"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Users, Activity, MapPin, List } from "lucide-react";
import Link from "next/link";
import styles from "./register.module.css";

type Pharmacist = {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  province: string;
  status: string;
};

export default function RegisterDashboard() {
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacists = async () => {
      try {
        const res = await fetch(
          "https://pharmacy-api-6w5d.onrender.com/pharmacists"
        );
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setPharmacists(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPharmacists();
  }, []);

  const uniqueStatuses = useMemo(() => {
    return [...new Set(pharmacists.map((p: any) => p.status).filter(Boolean))];
  }, [pharmacists]);

  const uniqueProvinces = useMemo(() => {
    return [...new Set(pharmacists.map((p: any) => p.province).filter(Boolean))];
  }, [pharmacists]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className={styles.title}>ทะเบียนเภสัชกร</h1>
        <p className={styles.breadcrumb}>
          ทะเบียนเภสัชกร / <span className="text-blue-600 font-medium">Dashboard</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3>เภสัชกรทั้งหมด</h3>
            <p className={styles.statValue}>{isLoading ? "..." : pharmacists.length}</p>
          </div>
          <div className={`${styles.statIcon} ${styles.iconBlue}`}>
            <Users size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3>สถานะที่มี</h3>
            <p className={styles.statValue}>{isLoading ? "..." : uniqueStatuses.length}</p>
          </div>
          <div className={`${styles.statIcon} ${styles.iconGreen}`}>
            <Activity size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3>พื้นที่ปฏิบัติงาน</h3>
            <p className={styles.statValue}>{isLoading ? "..." : uniqueProvinces.length}</p>
          </div>
          <div className={`${styles.statIcon} ${styles.iconPurple}`}>
            <MapPin size={24} />
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className={styles.actionsCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>จัดการข้อมูลทะเบียน</h2>
        </div>
        <div className={styles.dashboardAction}>
          <Link href="/backoffice/module/register/list" className={styles.actionButton}>
            <div className={`${styles.actionIcon} ${styles.actionIconBlue}`}>
              <List size={24} />
            </div>
            <span className={styles.actionLabel}>รวมข้อมูลสมาชิก</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
