"use client"; // 👈 สำคัญ: ต้องเป็น Client Component
import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Type, Save, Upload } from 'lucide-react';

export default function WebHomePage() {
  // State สำหรับเก็บข้อมูล
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [currentBanner, setCurrentBanner] = useState(''); // รูปจาก Server
  const [previewImage, setPreviewImage] = useState<string | null>(null); // รูปตัวอย่างที่เลือกใหม่
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // ไฟล์จริงที่จะส่งไป
  const [isLoading, setIsLoading] = useState(false);
  
  // ใช้ Ref เพื่อสั่งกด input file ที่ซ่อนอยู่
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. โหลดข้อมูลเก่ามาโชว์ตอนเปิดหน้าเว็บ
  useEffect(() => {
    fetch('http://localhost:8080/home-content')
      .then(res => res.json())
      .then(data => {
        if (data.welcomeMessage) setWelcomeMessage(data.welcomeMessage);
        if (data.bannerUrl) setCurrentBanner(data.bannerUrl);
      })
      .catch(err => console.error("Load error:", err));
  }, []);

  // 2. ฟังก์ชันเมื่อมีการเลือกรูปใหม่
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // สร้าง URL ปลอมๆ เพื่อโชว์ตัวอย่างรูปทันที (Preview)
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

      const res = await fetch('http://localhost:8080/home-content', {
        method: 'POST',
        body: formData, // ส่งไปแบบ Multipart (ไม่ต้องใส่ Content-Type)
      });

      if (res.ok) {
        alert('บันทึกข้อมูลเรียบร้อย!');
        // รีเฟรชหน้าเพื่อเคลียร์ค่า Preview
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

  return (
    <div className="p-6">
      
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
                onClick={() => fileInputRef.current?.click()} // คลิกกรอบแล้วเด้งหน้าเลือกไฟล์
                className="h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 overflow-hidden relative group"
            >
                {/* Logic การแสดงผล: ถ้ามีรูป Preview ให้โชว์ -> ถ้าไม่มีให้โชว์รูปเดิม -> ถ้าไม่มีให้โชว์ปุ่มบวก */}
                {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                ) : currentBanner ? (
                    <div className="relative w-full h-full">
                        <img src={currentBanner} alt="Current Banner" className="w-full h-full object-cover" />
                        {/* Overlay บอกว่าคลิกเพื่อเปลี่ยนรูป */}
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
                
                {/* Input file ซ่อนไว้ */}
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