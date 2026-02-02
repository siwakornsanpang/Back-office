"use client"; // 👈 1. ต้องประกาศว่าเป็น Client Component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Header from './layout/Header';// ตรวจสอบ path ให้ถูก
import Sidebar from './layout/Sidebar';// ตรวจสอบ path ให้ถูก

export default function BackOfficeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 🛡️ 2. ระบบ "ยามเฝ้าประตู" (Auth Guard)
  // ใครไม่มี Cookie 'auth_token' จะถูกดีดกลับไปหน้า Login ทันที
  useEffect(() => {
    const token = Cookies.get('auth_token');
    
    if (!token) {
      // ถ้าไม่มีตั๋ว ให้ดีดกลับ Login
      router.replace('/login');
    } else {
      // ถ้ามีตั๋ว อนุญาตให้แสดงเนื้อหา
      setIsAuthorized(true);
    }
  }, [router]);

  // ถ้ายังตรวจสอบไม่เสร็จ (หรือไม่มีสิทธิ์) ให้โชว์หน้าจอว่างๆ หรือ Loading ไปก่อน
  // เพื่อกันไม่ให้เห็นหน้า Backoffice แวบนึง
  if (!isAuthorized) {
    return null; // หรือใส่ <div className="p-10 text-center">Checking permission...</div>
  }

  return (
    <div className="bg-[#f3f4f6] min-h-screen font-sans">
      
      {/* ส่วน Fixed */}
      <Header />
      <Sidebar />

      {/* ส่วนเนื้อหาหลัก */}
      <main className="pt-[60px] pl-[260px] transition-all duration-300">
        <div className="p-6">
          {children}
        </div>
      </main>

    </div>
  );
}