import type { Metadata } from "next";
// import fonts หรือ css อื่นๆ ตามเดิมของคุณ


// Import Header และ Sidebar ของคุณ
import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";

export const metadata: Metadata = {
  title: "BackOffice System",
  description: "Back office management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="bg-[#f3f4f6] min-h-screen"> {/* ใส่สีพื้นหลังรวมตรงนี้ */}
        
        {/* 1. ส่วนที่ลอยอยู่ (Fixed Elements) */}
        <Header/>
        <Sidebar/>

        {/* 2. ส่วนกล่องรับเนื้อหา (Main Content Wrapper) */}
        {/* ต้องดันเนื้อหาลง (pt) และดันไปขวา (pl) ให้พ้นแนว Header/Sidebar */}
        <main 
          className="pt-[60px] pl-[260px]" // 🔥 หัวใจสำคัญอยู่ตรงนี้ครับ
        >
          {/* ใส่ padding เพิ่มอีกนิดหน่อยเพื่อให้เนื้อหาไม่ชิดขอบจนเกินไป */}
          <div className="p-6">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}