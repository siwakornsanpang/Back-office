"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Users, Activity, MapPin } from "lucide-react";
import styles from "./Register.module.css";

type Pharmacist = {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  province: string;
  status: string;
};

const PROVINCES = [
  { label: "กรุงเทพมหานคร", value: "กรุงเทพมหานคร" },
  { label: "เชียงใหม่", value: "เชียงใหม่" },
  { label: "ขอนแก่น", value: "ขอนแก่น" },
  { label: "ภูเก็ต", value: "ภูเก็ต" },
  { label: "นครราชสีมา", value: "นครราชสีมา" },
];

export default function Register() {
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProvince, setFilterProvince] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "license">("name");
  const [isLoading, setIsLoading] = useState(true);

  // ===============================
  // Fetch pharmacists data
  // ===============================
  useEffect(() => {
    const fetchPharmacists = async () => {
      try {
        const res = await fetch(
          "https://pharmacy-api-6w5d.onrender.com/pharmacists"
        );
        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();

        const mapped: Pharmacist[] = data.map((p: any) => {
          const cleanName = (p.name || "")
            .replace("ภก.", "")
            .replace("ภญ.", "")
            .trim();

          const parts = cleanName.split(" ");

          return {
            id: String(p.id),
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
            licenseNumber: p.registrationId || "",
            province: p.province || "",
            status: p.status || "",
          };
        });

        setPharmacists(mapped.slice(0, 10));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPharmacists();
  }, []);

  // ===============================
  // Get unique statuses and provinces
  // ===============================
  const uniqueStatuses = useMemo(() => {
    return [...new Set(pharmacists.map((p) => p.status).filter(Boolean))];
  }, [pharmacists]);

  const uniqueProvinces = useMemo(() => {
    return [...new Set(pharmacists.map((p) => p.province).filter(Boolean))];
  }, [pharmacists]);

  // ===============================
  // Filter + Search + Sort
  // ===============================
  const filteredPharmacists = useMemo(() => {
    return pharmacists
      .filter((p) => {
        const keyword = searchTerm.toLowerCase();

        const matchesSearch =
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(keyword) ||
          p.licenseNumber.toLowerCase().includes(keyword);

        const matchesProvince =
          !filterProvince || p.province === filterProvince;

        const matchesStatus =
          !filterStatus || p.status === filterStatus;

        return matchesSearch && matchesProvince && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return `${a.firstName}${a.lastName}`.localeCompare(
            `${b.firstName}${b.lastName}`
          );
        }
        return a.licenseNumber.localeCompare(b.licenseNumber);
      });
  }, [pharmacists, searchTerm, filterProvince, filterStatus, sortBy]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className={styles.title}>ทะเบียนเภสัชกร</h1>
        <p className={styles.breadcrumb}>Web Management / ทะเบียนเภสัชกร</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3>เภสัชกรทั้งหมด</h3>
            <p className={styles.statValue}>{pharmacists.length}</p>
          </div>
          <div className={`${styles.statIcon} ${styles.iconBlue}`}>
            <Users size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3>สถานะที่มี</h3>
            <p className={styles.statValue}>{uniqueStatuses.length}</p>
          </div>
          <div className={`${styles.statIcon} ${styles.iconGreen}`}>
            <Activity size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3>พื้นที่ปฏิบัติงาน</h3>
            <p className={styles.statValue}>{uniqueProvinces.length}</p>
          </div>
          <div className={`${styles.statIcon} ${styles.iconPurple}`}>
            <MapPin size={24} />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <h2 className={styles.filterTitle}>ตัวกรองและค้นหา</h2>
        <div className={styles.filterGrid}>
          {/* Search Input */}
          <div className={styles.filterInputWrapper}>
            <Search size={16} className={styles.filterInputIcon} />
            <input
              type="text"
              placeholder="ค้นหาชื่อ / เลขทะเบียน"
              className={styles.filterInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Province Filter */}
          <select
            value={filterProvince}
            onChange={(e) => setFilterProvince(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">ทั้งหมด - จังหวัด</option>
            {uniqueProvinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">ทั้งหมด - สถานะ</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr className={styles.tableHeadRow}>
                <th className={styles.tableHeadCell}>ชื่อ-นามสกุล</th>
                <th className={styles.tableHeadCell}>เลขทะเบียน</th>
                <th className={styles.tableHeadCell}>จังหวัด</th>
                <th className={styles.tableHeadCell}>สถานะ</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {isLoading ? (
                <tr className={styles.tableBodyRow}>
                  <td colSpan={4} className={styles.emptyState}>
                    <p style={{ margin: "2rem 0 0 0" }}>กำลังโหลดข้อมูล...</p>
                  </td>
                </tr>
              ) : filteredPharmacists.length > 0 ? (
                filteredPharmacists.map((p) => (
                  <tr key={p.id} className={styles.tableBodyRow}>
                    <td className={`${styles.tableBodyCell} ${styles.tableCellName}`}>
                      {p.firstName} {p.lastName}
                    </td>
                    <td className={styles.tableBodyCell}>
                      <span className={styles.tableCellLicense}>
                        {p.licenseNumber}
                      </span>
                    </td>
                    <td className={styles.tableBodyCell}>{p.province}</td>
                    <td className={styles.tableBodyCell}>
                      <span
                        className={`${styles.statusBadge} ${
                          p.status === "ใช้งาน"
                            ? styles.statusActive
                            : p.status === "พักใช้ใบอนุญาต"
                            ? styles.statusSuspended
                            : styles.statusInactive
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className={styles.tableBodyRow}>
                  <td colSpan={4} className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>📋</div>
                    <p className={styles.emptyStateText}>ไม่พบข้อมูล</p>
                    <p className={styles.emptyStateSubtext}>
                      ลองปรับตัวกรองหรือค้นหาใหม่อีกครั้ง
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredPharmacists.length > 0 && (
          <div className={styles.tableFooter}>
            <p className={styles.tableFooterText}>
              แสดง{" "}
              <span className={styles.tableFooterBold}>
                {filteredPharmacists.length}
              </span>{" "}
              จาก{" "}
              <span className={styles.tableFooterBold}>{pharmacists.length}</span>{" "}
              รายการ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
