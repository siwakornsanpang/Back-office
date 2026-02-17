"use client"; 
import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Type, Save, Upload, Trash2, MessageSquare, Edit, GripVertical, MonitorPlay } from 'lucide-react';
import Swal from 'sweetalert2'; // ✅ Import SweetAlert2
import withReactContent from 'sweetalert2-react-content'; // ✅ Import ตัวหุ้ม
import styles from './home.module.css';

// Setup SweetAlert
const MySwal = withReactContent(Swal);

type BannerItem = {
  id: string;
  url: string;    
  active: boolean;
  file?: File;
};

export default function WebHomePage() {
  const [headerText, setHeaderText] = useState('');
  const [subHeaderText, setSubHeaderText] = useState('');
  const [bodyText, setBodyText] = useState('');

  const [banners, setBanners] = useState<BannerItem[]>([]);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupUrl, setPopupUrl] = useState('');
  const [newPopupFile, setNewPopupFile] = useState<File | null>(null);
  const [popupPreview, setPopupPreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const popupInputRef = useRef<HTMLInputElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Load Data
  useEffect(() => {
    if (!API_URL) return;
    fetch(`${API_URL}/home-content`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setHeaderText(data.headerText || '');
          setSubHeaderText(data.subHeaderText || '');
          setBodyText(data.bodyText || '');
          setShowPopup(data.showPopup || false);
          setPopupUrl(data.popupImageUrl || '');
          
          if (data.banners) {
            setBanners(data.banners.map((b: any) => ({
                id: b.id,
                url: b.url,
                active: b.active
            })));
          }
        }
      });
  }, [API_URL]);

  const handleAddBanners = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newItems: BannerItem[] = filesArray.map(file => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(file),
        active: true,
        file: file
      }));
      setBanners(prev => [...prev, ...newItems]);
      
      // ✅ Toast แจ้งเตือนเล็กๆ ว่าเพิ่มรูปแล้ว
      const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true
      });
      Toast.fire({ icon: 'success', title: `เพิ่ม ${filesArray.length} รูปเรียบร้อย` });
    }
  };

  const handleChangeImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const updated = [...banners];
        updated[index].file = file; 
        updated[index].url = URL.createObjectURL(file); 
        setBanners(updated);
    }
  };

  // ✅ 1. ใช้ SweetAlert ยืนยันการลบ
const handleRemoveBanner = async (index: number) => {
    // 1. ถามยืนยันก่อน
    const result = await MySwal.fire({
        title: 'ยืนยันการลบ?',
        text: "ข้อมูลจะถูกลบออกจากระบบทันทีและไม่สามารถกู้คืนได้",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444', // สีแดง
        cancelButtonColor: '#d1d5db',
        confirmButtonText: 'ลบข้อมูล',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true
    });

    if (result.isConfirmed) {
        // โชว์ Loading ระหว่างลบ
        MySwal.fire({
            title: 'กำลังลบ...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            // A. เตรียมรายการ Banner ใหม่ (ตัดตัวที่เลือกออก)
            const updatedBanners = [...banners];
            updatedBanners.splice(index, 1);

            // B. เตรียมข้อมูลส่งไปบันทึกทันที (เหมือนกด Save แต่ใช้ list ใหม่)
            const formData = new FormData();
            formData.append("headerText", headerText);
            formData.append("subHeaderText", subHeaderText);
            formData.append("bodyText", bodyText);
            formData.append("showPopup", String(showPopup));

            // สร้าง Metadata ของ Banner ที่เหลืออยู่
            const bannerMetadata = updatedBanners.map(b => ({
                id: b.id.startsWith('temp-') ? null : b.id,
                url: b.url,
                active: b.active,
                isNewFile: !!b.file
            }));
            formData.append("bannerData", JSON.stringify(bannerMetadata));

            // ถ้ามีรูปใหม่ที่รอ Save ติดอยู่ใน list ก็ต้องส่งไปด้วย (กันหาย)
            updatedBanners.forEach(b => {
                if (b.file) {
                    formData.append("bannerFiles", b.file);
                }
            });

            // ส่งรูป Popup ด้วย (ถ้ามีการรออัปโหลดอยู่)
            if (newPopupFile) formData.append("popupImage", newPopupFile);

            // C. ยิง API บันทึกเลย
            const res = await fetch(`${API_URL}/home-content`, { method: 'POST', body: formData });
            if (!res.ok) throw new Error("Failed");

            // D. อัปเดตหน้าจอ + โชว์ Popup สำเร็จตรงกลาง
            setBanners(updatedBanners);
            
            await MySwal.fire({
                title: 'ลบสำเร็จ', // ข้อความตามที่คุณต้องการ
                icon: 'success',
                showConfirmButton: true,
                confirmButtonColor: '#2563eb', // สีน้ำเงิน
                confirmButtonText: 'OK',
                timer: 1500 // ปิดเองใน 1.5 วิ หรือจะกด OK ก็ได้
            });

        } catch (error) {
            console.error(error);
            MySwal.fire('Error', 'เกิดข้อผิดพลาดในการลบ', 'error');
        }
    }
  };

  const handleToggleBanner = (index: number) => {
    const updated = [...banners];
    updated[index].active = !updated[index].active;
    setBanners(updated);
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
    const copyListItems = [...banners];
    const dragItemContent = copyListItems[dragItem.current!];
    copyListItems.splice(dragItem.current!, 1); 
    copyListItems.splice(dragOverItem.current!, 0, dragItemContent); 
    dragItem.current = index; 
    setBanners(copyListItems);
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // ✅ 2. ใช้ SweetAlert ตอนบันทึก (Loading -> Success/Error)
  const handleSave = async () => {
    if (!API_URL) return;
    
    // โชว์ Loading
    MySwal.fire({
        title: 'กำลังบันทึก...',
        text: 'กรุณารอสักครู่ ห้ามปิดหน้าต่างนี้',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("headerText", headerText);
      formData.append("subHeaderText", subHeaderText);
      formData.append("bodyText", bodyText);
      formData.append("showPopup", String(showPopup));

      const bannerMetadata = banners.map(b => ({
        id: b.id.startsWith('temp-') ? null : b.id, 
        url: b.url, 
        active: b.active,
        isNewFile: !!b.file 
      }));
      formData.append("bannerData", JSON.stringify(bannerMetadata));

      banners.forEach(b => {
        if (b.file) {
            formData.append("bannerFiles", b.file);
        }
      });

      if (newPopupFile) formData.append("popupImage", newPopupFile);

      const res = await fetch(`${API_URL}/home-content`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error("Failed");
      
      // ✅ บันทึกสำเร็จ
      await MySwal.fire({
          title: 'สำเร็จ!',
          text: 'บันทึกข้อมูลหน้าแรกเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#2563eb',
          confirmButtonText: 'ตกลง'
      });
      
      window.location.reload();

    } catch (error) {
      console.error(error);
      // ❌ บันทึกพลาด
      await MySwal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่',
          icon: 'error',
          confirmButtonText: 'ปิด'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
            <h2 className={styles.title}>จัดการหน้าแรก</h2>
            <p className={styles.breadcrumb}>Web Management / Home Content</p>
        </div>
        <button onClick={handleSave} disabled={isLoading} className={styles.saveButton}>
            <Save size={18} />
            <span>บันทึกการแก้ไข</span>
        </button>
      </div>

      <div className={styles.gridContainer}>
        
        {/* Banner Section */}
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.iconBox} style={{backgroundColor: '#eff6ff', color: '#2563eb'}}>
                    <ImageIcon size={24} />
                </div>
                <div>
                    <h3 className={styles.cardTitle}>Banner Slideshow</h3>
                    <p style={{fontSize:'0.85rem', color:'#6b7280', margin:0}}>
                        ลากรูปเพื่อเปลี่ยนลำดับ • คลิกไอคอนดินสอเพื่อเปลี่ยนรูป
                    </p>
                </div>
            </div>

            <div className={styles.uploadArea} style={{marginBottom:'1.5rem'}}>
                <label style={{cursor:'pointer', width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                    <Upload size={32} />
                    <span style={{fontWeight:600, marginTop:'0.5rem'}}>เพิ่มรูป Banner ใหม่ (ต่อท้าย)</span>
                    <input type="file" multiple hidden accept="image/*" onChange={handleAddBanners}/>
                </label>
            </div>

            <div className={styles.bannerList}>
                {banners.map((banner, index) => (
                    <div 
                        key={banner.id} 
                        className={styles.bannerCard}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()} 
                        style={{ opacity: banner.active ? 1 : 0.6 }}
                    >
                        <div className={styles.orderBadge}>
                            <GripVertical size={14} style={{marginRight:'4px'}}/> 
                            ลำดับที่ {index + 1}
                        </div>
                        
                        <img src={banner.url} className={styles.bannerImage} draggable={false} />
                        
                        <div className={styles.bannerControls}>
                            <label className={styles.statusToggle}>
                                <div className={styles.switch}>
                                    <input type="checkbox" checked={banner.active} onChange={() => handleToggleBanner(index)} />
                                    <span className={styles.slider}></span>
                                </div>
                                <span style={{fontSize:'0.8rem', marginLeft:'6px'}}>
                                    {banner.active ? 'แสดง' : 'ซ่อน'}
                                </span>
                            </label>

                            <div style={{display:'flex'}}>
                                <label className={styles.editBtn} title="เปลี่ยนรูป">
                                    <Edit size={18} />
                                    <input type="file" hidden accept="image/*" onChange={(e) => handleChangeImage(index, e)}/>
                                </label>

                                <button onClick={() => handleRemoveBanner(index)} className={styles.deleteBtn} title="ลบรูป">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Text Section */}
        <div className={styles.card}>
             <div className={styles.cardHeader}>
                <div className={styles.iconBox} style={{backgroundColor: '#f0fdf4', color: '#16a34a'}}>
                    <Type size={24} />
                </div>
                <h3 className={styles.cardTitle}>ข้อความต้อนรับบนภาพ</h3>
            </div>
            <div style={{display:'grid', gap:'1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'}}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>บรรทัดที่ 1</label>
                    <input type="text" className={styles.input} value={headerText} onChange={e => setHeaderText(e.target.value)} placeholder="เช่น สภาเภสัชกรรม" />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>บรรทัดที่ 2</label>
                    <input type="text" className={styles.input} value={subHeaderText} onChange={e => setSubHeaderText(e.target.value)} placeholder="เช่น The Pharmacy Council of Thailand" />
                </div>
            </div>
            <div className={styles.inputGroup}>
                <label className={styles.label}>บรรทัดที่ 3</label>
                <textarea className={styles.textarea} rows={3} value={bodyText} onChange={e => setBodyText(e.target.value)} placeholder="เช่น สภาเคียงข้าง สร้างวิชาชีพ..." />
            </div>
        </div>

        {/* Popup Section */}
        <div className={styles.card}>
             <div className={styles.cardHeader}>
                <div className={styles.iconBox} style={{backgroundColor: '#faf5ff', color: '#9333ea'}}>
                    <MessageSquare size={24} />
                </div>
                <h3 className={styles.cardTitle}>Popup ข่าวสาร</h3>
                <div style={{marginLeft:'auto'}}>
                    <label className={styles.statusToggle}>
                        <span style={{marginRight:'10px'}}>เปิดใช้งาน:</span>
                        <div className={styles.switch}>
                            <input type="checkbox" checked={showPopup} onChange={e => setShowPopup(e.target.checked)} />
                            <span className={styles.slider}></span>
                        </div>
                    </label>
                </div>
            </div>
             <div onClick={() => popupInputRef.current?.click()} className={styles.uploadArea} style={{opacity: showPopup ? 1 : 0.5}}>
                {(popupPreview || popupUrl) ? (
                    <img src={popupPreview || popupUrl} style={{maxWidth:'100%', maxHeight:'250px', objectFit:'contain'}} />
                ) : (
                    <>
                        <MonitorPlay size={32} className="mb-2 opacity-50"/>
                        <span>คลิกอัปโหลด Popup</span>
                    </>
                )}
                <input type="file" ref={popupInputRef} hidden accept="image/*" onChange={(e) => {
                     const file = e.target.files?.[0];
                     if(file) { setNewPopupFile(file); setPopupPreview(URL.createObjectURL(file)); }
                }}/>
            </div>
        </div>

      </div>
    </div>
  );
}