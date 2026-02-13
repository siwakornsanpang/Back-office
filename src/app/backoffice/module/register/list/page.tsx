"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronLeft } from "lucide-react";
import Link from "next/link";
import styles from "../Register.module.css";

type Pharmacist = {
    id: string;
    firstName: string;
    lastName: string;
    licenseNumber: string;
    province: string;
    status: string;
};

export default function RegisterList() {
    const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterProvince, setFilterProvince] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "license">("name");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

                setPharmacists(mapped);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPharmacists();
    }, []);

    const uniqueStatuses = useMemo(() => {
        return [...new Set(pharmacists.map((p) => p.status).filter(Boolean))];
    }, [pharmacists]);

    const uniqueProvinces = useMemo(() => {
        return [...new Set(pharmacists.map((p) => p.province).filter(Boolean))];
    }, [pharmacists]);

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

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterProvince, filterStatus, sortBy]);

    // Pagination Calculations
    const totalPages = Math.ceil(filteredPharmacists.length / itemsPerPage);
    const paginatedPharmacists = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPharmacists.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPharmacists, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <Link href="/backoffice/module/register" className={styles.backButton} style={{ display: 'flex', alignItems: 'center', color: '#6b7280', textDecoration: 'none' }}>
                        <ChevronLeft size={20} />
                        <span>กลับหน้าหลัก</span>
                    </Link>
                </div>
                <h1 className={styles.title}>รวมข้อมูลสมาชิก</h1>
                <p className={styles.breadcrumb}>
                    Web Management / ทะเบียนเภสัชกร / รวมข้อมูลสมาชิก
                </p>
            </div>

            {/* Filter Section */}
            <div className={styles.filterSection}>
                <h2 className={styles.filterTitle}>ตัวกรองและค้นหา</h2>
                <div className={styles.filterGrid}>
                    {/* Search */}
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

                    {/* Province */}
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

                    {/* Status */}
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

            {/* Table */}
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
                                <tr>
                                    <td colSpan={4} className={styles.emptyState}>
                                        กำลังโหลดข้อมูล...
                                    </td>
                                </tr>
                            ) : paginatedPharmacists.length > 0 ? (
                                paginatedPharmacists.map((p) => (
                                    <tr key={p.id} className={styles.tableBodyRow}>
                                        <td className={styles.tableBodyCell}>
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
                                                className={`${styles.statusBadge} ${p.status === "ใช้งาน"
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
                                <tr>
                                    <td colSpan={4} className={styles.emptyState}>
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredPharmacists.length > 0 && (
                    <div className={styles.tableFooter}>
                        <div className={styles.paginationInfo}>
                            แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, filteredPharmacists.length)} - {Math.min(currentPage * itemsPerPage, filteredPharmacists.length)} จาก {filteredPharmacists.length} รายการ
                        </div>

                        <div className={styles.paginationControls}>
                            <button
                                className={styles.pageBtn}
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                ก่อนหน้า
                            </button>

                            <div className={styles.pageNumbers}>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        className={`${styles.pageNum} ${currentPage === i + 1 ? styles.pageNumActive : ''}`}
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                className={styles.pageBtn}
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                ถัดไป
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
