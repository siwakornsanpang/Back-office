// src/app/backoffice/web/about/council/[category]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { Save, User, Camera, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

// 1. Config ชื่อไทย
const COUNCIL_TITLES: Record<string, string> = {
  'elected': 'กรรมการจากการเลือกตั้ง',
  'appointed': 'กรรมการจากการแต่งตั้ง',
};

export default function CouncilMemberPage() {
  const params = useParams();
  const categorySlug = (Array.isArray(params.category) ? params.category[0] : params.category) || '';
  const titleTH = COUNCIL_TITLES[categorySlug] || categorySlug;

  // Mock Data: รายชื่อคน (ในอนาคตดึงจาก API)
  const [members, setMembers] = useState([
    { id: 1, name: 'ภก.สมชาย ใจดี', position: 'นายกสภา', image: null },
    { id: 2, name: 'ภญ.สมหญิง จริงใจ', position: 'กรรมการ', image: null },
  ]);

  return (
    <div className="p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="text-blue-600" />
            จัดการ: {titleTH}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            เกี่ยวกับองค์กร / คณะกรรมการ / <span className="text-blue-600">{titleTH}</span>
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
           <span>+ เพิ่มรายชื่อ</span>
        </button>
      </div>

      {/* Grid แสดงรายชื่อ (Card) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {members.map((member) => (
          <div key={member.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            
            {/* ส่วนรูปภาพ (Profile Image) */}
            <div className="h-48 bg-gray-100 relative flex items-center justify-center">
              {member.image ? (
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                   <User size={48} />
                   <span className="text-xs mt-2">ไม่มีรูปภาพ</span>
                </div>
              )}
              
              {/* ปุ่มเปลี่ยนรูป (โผล่ตอนเอาเมาส์ชี้) */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <button className="text-white flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm hover:bg-white/30">
                    <Camera size={16} /> เปลี่ยนรูป
                 </button>
              </div>
            </div>

            {/* ส่วนข้อมูล (Info) */}
            <div className="p-4">
              <input 
                type="text" 
                value={member.name}
                className="block w-full font-bold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none mb-1 pb-1 transition-colors"
              />
              <input 
                type="text" 
                value={member.position}
                className="block w-full text-sm text-gray-500 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none pb-1 transition-colors"
              />
              
              <div className="mt-4 flex justify-end gap-2">
                 <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="ลบ">
                    <Trash2 size={16} />
                 </button>
                 <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="บันทึก">
                    <Save size={16} />
                 </button>
              </div>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}