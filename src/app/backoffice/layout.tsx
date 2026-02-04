// src/app/backoffice/layout.tsx (หรือไฟล์ layout ที่คุณใช้)
"use client"; 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Header from './layout/Header'; // ตรวจสอบ path import ให้ถูก
import Sidebar from './layout/Sidebar'; // ตรวจสอบ path import ให้ถูก

export default function BackOfficeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // 1. สร้าง State สำหรับเปิด/ปิด Sidebar (ค่าเริ่มต้นคือ true = เปิด)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (!token) {
      router.replace('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return null; 
  }

  return (
    <div className="bg-[#f3f4f6] min-h-screen font-sans">
      
      {/* 2. ส่งฟังก์ชันสลับสถานะไปให้ Header */}
      <Header onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      {/* 3. ส่งสถานะปัจจุบันไปให้ Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* 4. ปรับ Padding ของ Main Content ตามสถานะ Sidebar */}
      <main 
        className={`
            pt-[60px] 
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'pl-[260px]' : 'pl-0'} 
        `}
      >
        <div className="p-6">
          {children}
        </div>
      </main>

    </div>
  );
}