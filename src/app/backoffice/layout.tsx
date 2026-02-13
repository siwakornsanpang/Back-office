"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";

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

  // เช็คว่า mount แล้ว
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // เช็ค auth หลัง mount เท่านั้น
  useEffect(() => {
    if (!isMounted) return;

    const token = Cookies.get("auth_token");

    if (!token) {
      setIsAuthorized(false);
      router.replace("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [isMounted, router]);

  // ระหว่างยังไม่ mount → render เปล่าไว้ก่อน
  if (!isMounted) {
    return null;
  }

  // ระหว่างกำลังเช็ค auth
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // ไม่ผ่าน auth
  if (isAuthorized === false) {
    return null;
  }

  return (
    <div className="bg-[#f3f4f6] min-h-screen font-sans">
      {/* Header */}
      <Header onToggle={() => setIsSidebarOpen((prev) => !prev)} />

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Main Content */}
      <main
        className={`
          pt-[60px]
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "pl-[260px]" : "pl-0"}
        `}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
