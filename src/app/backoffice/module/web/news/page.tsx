"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge, Button, Select } from "@/app/components/common/FormElements";
import { Table, TableCell, TableRow } from "@/app/components/common/Table";
import { loadNews, type NewsItem } from "./newsStorage";

function formatDateTime(iso?: string) {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function News() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");

  useEffect(() => {
    setItems(loadNews());
  }, []);

  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(items.map((it) => it.year)))
      .sort((a, b) => b - a)
      .map((y) => ({ label: y.toString(), value: y.toString() }));
    return [{ label: "ทุกปี", value: "all" }, ...years];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const year = yearFilter === "all" ? null : Number(yearFilter);

    return items
      .filter((it) => (q ? it.title.toLowerCase().includes(q) : true))
      .filter((it) => (year ? it.year === year : true))
      .sort((a, b) => {
        // year desc, then order asc
        if (a.year !== b.year) return b.year - a.year;
        if (a.order !== b.order) return a.order - b.order;
        // stable-ish fallback
        return (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt);
      });
  }, [items, query, yearFilter]);

  const headers = ["หัวข้อ", "ปี", "ลำดับ", "สถานะ", "อัปเดตล่าสุด", "จัดการ"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ข่าวประชาสัมพันธ์</h1>
          <p className="text-sm text-gray-500">จัดการข่าว (MVP: แสดงรายการจาก localStorage)</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-[320px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาหัวข้อข่าว"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-800 placeholder:text-gray-400"
            />
          </div>

          <div className="w-[160px]">
            <Select
              label="ปี"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              options={yearOptions}
            />
          </div>

          <Button variant="secondary" disabled>
            เพิ่มข่าว (สเต็ปถัดไป)
          </Button>
        </div>
      </div>

      <Table headers={headers} isLoading={false}>
        {filtered.length === 0 ? (
          <TableRow>
            <TableCell colSpan={headers.length} className="py-10 text-center text-gray-500">
              ไม่พบรายการข่าว
            </TableCell>
          </TableRow>
        ) : (
          filtered.map((it) => (
            <TableRow key={it.id}>
              <TableCell className="font-medium text-gray-800">{it.title}</TableCell>
              <TableCell className="text-gray-700">{it.year}</TableCell>
              <TableCell className="text-gray-700">{it.order}</TableCell>
              <TableCell>
                <Badge color={it.status === "published" ? "green" : "gray"}>
                  {it.status === "published" ? "เผยแพร่" : "ร่าง"}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600">
                {formatDateTime(it.updatedAt ?? it.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" disabled>
                    แก้ไข
                  </Button>
                  <Button variant="danger" disabled>
                    ลบ
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </Table>
    </div>
  );
}