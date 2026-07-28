"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";
import { SkeletonPage } from "@/app/components/ui/Skeleton";

export default function BackOfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // null = ยังไม่เช็ค
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // รอให้ component mount ก่อน (กัน hydration issue)
  const [isMounted, setIsMounted] = useState(false);

  // sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ข้อมูล User จาก Cookie
  const [userRole, setUserRole] = useState('viewer');
  const [userName, setUserName] = useState('User');

  // เช็คว่า mount แล้ว
  useEffect(() => {
    queueMicrotask(() => {
      setIsMounted(true);
    });
  }, []);

  // เช็ค auth + อ่านข้อมูล user หลัง mount
  useEffect(() => {
    if (!isMounted) return;

    queueMicrotask(() => {
    const token = Cookies.get("auth_token");

    if (!token) {
      setIsAuthorized(false);
      router.replace("/login");
    } else {
      setIsAuthorized(true);
      // อ่านข้อมูล user จาก cookies
      setUserRole(Cookies.get("user_role") || 'viewer');
      setUserName(Cookies.get("user_display_name") || 'User');
    }
    });
  }, [isMounted, router]);

  // ระหว่างยังไม่ mount → render เปล่าไว้ก่อน
  if (!isMounted) {
    return null;
  }

  // ระหว่างกำลังเช็ค auth
  if (isAuthorized === null) {
    return <SkeletonPage />;
  }

  // ไม่ผ่าน auth
  if (isAuthorized === false) {
    return null;
  }

  return (
    <div className="bg-[#f3f4f6] min-h-screen font-sans">
      {/* Header — ส่ง userName + userRole */}
      <Header 
        onToggle={() => setIsSidebarOpen((prev) => !prev)} 
        userName={userName}
        userRole={userRole}
      />

      {/* Sidebar — ส่ง userRole + userName + onToggle */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        userRole={userRole}
        userName={userName}
      />

      {/* Main Content */}
      <main
        className={`
          pt-[72px]
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "pl-[220px]" : "pl-0"}
        `}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
