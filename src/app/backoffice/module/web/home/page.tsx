"use client"; 
import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Type, Save, Upload } from 'lucide-react';

export default function WebHomePage() {
  // State สำหรับเก็บข้อมูล
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [currentBanner, setCurrentBanner] = useState(''); 
  const [previewImage, setPreviewImage] = useState<string | null>(null); 
  const [selectedFile, setSelectedFile] = useState<File | null>(null); 
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔥 ดึง URL จาก .env.local (ถ้าไม่มีให้ใช้ localhost เป็นค่าสำรอง)
  const API_URL = process.env.NEXT_PUBLIC_API_URL ;

  // 1. โหลดข้อมูลเก่ามาโชว์
  useEffect(() => {
    // 🔥 แก้ตรงนี้: ใช้ API_URL แทน localhost
    fetch(`${API_URL}/home-content`)
      .then(res => res.json())
      .then(data => {
        if (data.welcomeMessage) setWelcomeMessage(data.welcomeMessage);
        if (data.bannerUrl) setCurrentBanner(data.bannerUrl);
      })
      .catch(err => console.error("Load error:", err));
  }, [API_URL]); // เพิ่ม dependency API_URL

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 3. ฟังก์ชันบันทึกข้อมูล
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('welcomeMessage', welcomeMessage);
      if (selectedFile) {
        formData.append('bannerImage', selectedFile);
      }

      // 🔥 แก้ตรงนี้: ใช้ API_URL แทน localhost
      const res = await fetch(`${API_URL}/home-content`, {
        method: 'POST',
        body: formData, 
      });

      if (res.ok) {
        const result = await res.json(); // อ่านผลลัพธ์จาก Server หน่อย
        alert('บันทึกข้อมูลเรียบร้อย!');
        window.location.reload();
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (error) {
      console.error(error);
      alert('เชื่อมต่อ Server ไม่ได้');
    } finally {
      setIsLoading(false);
    }
  };

  // ... (ส่วน return JSX ข้างล่างเหมือนเดิมเป๊ะ ไม่ต้องแก้) ...
  return (
    <div className="p-6">
      {/* ... (เนื้อหา UI เดิม) ... */}
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">จัดการหน้าแรก</h2>
            <p className="text-gray-500 text-sm">Web Management / หน้าแรก</p>
        </div>
        <button 
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition disabled:bg-gray-400"
        >
            <Save size={18} />
            <span>{isLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card: จัดการ Banner */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <ImageIcon size={24} />
                </div>
                <h3 className="font-semibold text-gray-700">Banner สไลด์หลัก</h3>
            </div>
            
            {/* พื้นที่แสดงรูป / ปุ่มอัปโหลด */}
            <div 
                onClick={() => fileInputRef.current?.click()} 
                className="h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 overflow-hidden relative group"
            >
                {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                ) : currentBanner ? (
                    <div className="relative w-full h-full">
                        <img src={currentBanner} alt="Current Banner" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition">
                            <Upload size={24} className="mr-2"/> คลิกเพื่อเปลี่ยนรูป
                        </div>
                    </div>
                ) : (
                    <>
                        <Upload size={32} className="mb-2 opacity-50"/>
                        <span>+ อัปโหลดรูปภาพ</span>
                        <span className="text-xs mt-1">ขนาดแนะนำ 1920 x 600 px</span>
                    </>
                )}
                
                <input 
                    type="file" 
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
            {currentBanner && !previewImage && (
                 <p className="text-xs text-gray-400 mt-2 text-center">รูปปัจจุบันที่แสดงอยู่</p>
            )}
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
                className="w-full h-48 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="กรอกข้อความต้อนรับที่นี่..."
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
            ></textarea>
        </div>

      </div>

    </div>
  );
}