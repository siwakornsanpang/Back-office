// src/app/admin/web/home/page.tsx
import { Image, Type, Save } from 'lucide-react'; // ตัวอย่างไอคอน

export default function WebHomePage() {
  return (
    <div className="p-6">
      
      {/* 1. Header ของหน้านี้ */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">จัดการหน้าแรก</h2>
            <p className="text-gray-500 text-sm">Web Management / หน้าแรก</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Save size={18} />
            <span>บันทึกการแก้ไข</span>
        </button>
      </div>

      {/* 2. เนื้อหา (ตัวอย่าง Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card: จัดการ Banner */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Image size={24} />
                </div>
                <h3 className="font-semibold text-gray-700">Banner สไลด์หลัก</h3>
            </div>
            <div className="h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50">
                <span>+ อัปโหลดรูปภาพ</span>
                <span className="text-xs mt-1">ขนาดแนะนำ 1920 x 600 px</span>
            </div>
        </div>

        {/* Card: จัดการข้อความต้อนรับ */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <Type size={24} />
                </div>
                <h3 className="font-semibold text-gray-700">ข้อความต้อนรับ</h3>
            </div>
            <textarea 
                className="w-full h-40 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="กรอกข้อความต้อนรับที่นี่..."
            ></textarea>
        </div>

      </div>

    </div>
  );
}