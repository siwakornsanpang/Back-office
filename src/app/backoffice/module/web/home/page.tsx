"use client"; 
import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Type, Save, Upload } from 'lucide-react';
// 🔥 Import CSS Module เข้ามา
import styles from './page.module.css';

export default function WebHomePage() {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [currentBanner, setCurrentBanner] = useState(''); 
  const [previewImage, setPreviewImage] = useState<string | null>(null); 
  const [selectedFile, setSelectedFile] = useState<File | null>(null); 
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!API_URL) return;
    fetch(`${API_URL}/home-content`)
      .then(res => res.json())
      .then(data => {
        if (data.welcomeMessage) setWelcomeMessage(data.welcomeMessage);
        if (data.bannerUrl) setCurrentBanner(data.bannerUrl);
      })
      .catch(err => console.error("Load error:", err));
  }, [API_URL]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!API_URL) {
      alert("หา API ไม่เจอ กรุณาเช็ค .env.local");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('welcomeMessage', welcomeMessage);
      if (selectedFile) {
        formData.append('bannerImage', selectedFile);
      }

      const res = await fetch(`${API_URL}/home-content`, {
        method: 'POST',
        body: formData, 
      });

      if (res.ok) {
        await res.json();
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

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.header}>
        <div>
            <h2 className={styles.title}>จัดการหน้าแรก</h2>
            <p className={styles.breadcrumb}>Web Management / หน้าแรก</p>
        </div>
        <button 
            onClick={handleSave}
            disabled={isLoading}
            className={styles.saveButton}
        >
            <Save size={18} />
            <span>{isLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</span>
        </button>
      </div>

      <div className={styles.gridContainer}>
        
        {/* Card: จัดการ Banner */}
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={`${styles.iconBox} ${styles.iconBlue}`}>
                    <ImageIcon size={24} />
                </div>
                <h3 className={styles.cardTitle}>Banner สไลด์หลัก</h3>
            </div>
            
            <div 
                onClick={() => fileInputRef.current?.click()} 
                className={styles.uploadArea}
            >
                {previewImage ? (
                    <img src={previewImage} alt="Preview" className={styles.previewImage} />
                ) : currentBanner ? (
                    <div className="relative w-full h-full">
                        <img src={currentBanner} alt="Current Banner" className={styles.previewImage} />
                        <div className={styles.imageOverlay}>
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
                 <p className={styles.uploadText} style={{ textAlign: 'center', color: '#9ca3af', marginTop: '0.5rem' }}>รูปปัจจุบันที่แสดงอยู่</p>
            )}
        </div>

        {/* Card: จัดการข้อความต้อนรับ */}
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={`${styles.iconBox} ${styles.iconGreen}`}>
                    <Type size={24} />
                </div>
                <h3 className={styles.cardTitle}>ข้อความต้อนรับ</h3>
            </div>
            <textarea 
                className={styles.textarea}
                placeholder="กรอกข้อความต้อนรับที่นี่..."
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
            ></textarea>
        </div>

      </div>

    </div>
  );
}