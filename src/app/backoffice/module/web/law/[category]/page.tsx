// src/app/backoffice/web/law/[category]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { Save, Upload, FileText, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

// 1. ดิกชันนารีแปลชื่อไทย (Config)
// key ต้องตรงกับที่คุณตั้งใน menuConfig.tsx
const LAW_TITLES: Record<string, string> = {
  'law1': 'พระราชบัญญัติวิชาชีพเภสัชกรรม',
  'law2': 'ข้อบังคับสภาเภสัชกรรม',
  'law3': 'ประกาศสภาเภสัชกรรม',
  'law4': 'กฎกระทรวง',
  'law5': 'กฎหมายอื่นที่เกี่ยวข้อง',
  'law6': 'คำสั่งสภาเภสัชกรรม',
  'law7': 'ระเบียบสภาเภสัชกรรม'
};

export default function LawDynamicPage() {
// 2. ดึงค่า category จาก URL
  const params = useParams();
  
  // แปลง params.category ให้เป็น string ที่ปลอดภัย (ใส่ || '' เพื่อกันค่าว่าง)
  const categorySlug = (Array.isArray(params.category) ? params.category[0] : params.category) || '';
  
  // แปลเป็นชื่อไทย (ถ้าไม่เจอให้ใช้ค่าเดิม)
  const titleTH = LAW_TITLES[categorySlug] || categorySlug;
  // State สำหรับฟอร์ม
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');

  // Reset ฟอร์มเมื่อเปลี่ยนหน้า (กรณี User กดเปลี่ยนเมนูซ้ายมือ)
  useEffect(() => {
    setTitle('');
    setDetail('');
  }, [categorySlug]);

  const handleSave = () => {
    alert(`กำลังบันทึกข้อมูลลงหมวด: ${categorySlug}\nหัวข้อ: ${title}`);
    // ตรงนี้อนาคตจะเปลี่ยนเป็น Call API
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      
      {/* --- Header --- */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
             <FileText className="text-blue-600" />
             จัดการ: {titleTH}
          </h2>
          <p className="text-gray-500 text-sm mt-1 ml-9">
            Web Management / กฎหมาย / <span className="text-blue-600 font-medium">{titleTH}</span>
          </p>
        </div>




        <button 
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md transition-all flex items-center gap-2 font-medium"
        >
          <Save size={20} />
          <span>บันทึกข้อมูล</span>
        </button>
      </div>

      {/* --- Form Card --- */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-blue-600 mt-0.5" size={20} />
            <div className="text-sm text-blue-800">
                คุณกำลังเพิ่มข้อมูลลงในหมวด <strong>"{titleTH}"</strong> 
            </div>
        </div>

        <div className="space-y-6">
            {/* Input ชื่อเรื่อง */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ชื่อกฎหมาย / ชื่อเรื่อง <span className="text-red-500">*</span>
                </label>
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder={`เช่น พรบ. ${titleTH} ฉบับที่ 1...`}
                />
            </div>

            {/* Textarea รายละเอียด */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    รายละเอียด / หมายเหตุ
                </label>
                <textarea 
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    placeholder="ระบุรายละเอียดสังเขป..."
                ></textarea>
            </div>

            {/* File Upload (Mock UI) */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    แนบไฟล์ PDF ฉบับเต็ม
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-blue-400 cursor-pointer transition-all group">
                    <div className="p-3 bg-gray-100 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                        <Upload size={24} className="text-gray-500 group-hover:text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">คลิกเพื่ออัปโหลดไฟล์</span>
                    <span className="text-xs mt-1">รองรับไฟล์ PDF ขนาดไม่เกิน 10MB</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}