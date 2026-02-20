"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Type, Save, Upload, Trash2, MessageSquare, Edit, GripVertical, MonitorPlay, ZoomIn, ZoomOut } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';
import styles from './home.module.css';
import Editor from '@/app/components/editor/editor';

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

  // --- State สำหรับระบบ ครอปภาพ ---
  const [isCropping, setIsCropping] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<'add' | 'edit'>('add');
  const [editTargetIndex, setEditTargetIndex] = useState<number | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

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

  // 🔥 1. ฟังก์ชันเมื่อเลือกรูป (แทนที่ของเดิม) จะเปิดหน้าต่าง Crop
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'add' | 'edit', index: number | null = null) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      setImageToCrop(imageUrl);
      setCropType(type);
      setEditTargetIndex(index);
      setIsCropping(true);

      // Reset ค่าเริ่มต้นตอนเปิดหน้าต่าง crop
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      e.target.value = '';
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // 🔥 2. ฟังก์ชันกดยืนยันการตัดรูป
  const handleConfirmCrop = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      const croppedFile = await getCroppedImg(imageToCrop, croppedAreaPixels, `banner-${Date.now()}.jpg`);
      if (!croppedFile) throw new Error("Crop failed");

      const croppedUrl = URL.createObjectURL(croppedFile);

      if (cropType === 'add') {
        const newItem: BannerItem = {
          id: `temp-${Date.now()}`,
          url: croppedUrl,
          active: true,
          file: croppedFile
        };
        setBanners(prev => [...prev, newItem]);
        const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        Toast.fire({ icon: 'success', title: 'เพิ่มรูปแบนเนอร์เรียบร้อย' });

      } else if (cropType === 'edit' && editTargetIndex !== null) {
        const updated = [...banners];
        updated[editTargetIndex].file = croppedFile;
        updated[editTargetIndex].url = croppedUrl;
        setBanners(updated);
      }

      setIsCropping(false);
      setImageToCrop(null);

    } catch (e) {
      console.error(e);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถตัดรูปภาพได้", "error");
    }
  };

  const handleRemoveBanner = async (index: number) => {
    const result = await MySwal.fire({
      title: 'ยืนยันการลบ?',
      text: "ข้อมูลจะถูกลบออกจากระบบทันทีและไม่สามารถกู้คืนได้",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      MySwal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      try {
        const updatedBanners = [...banners];
        updatedBanners.splice(index, 1);

        const formData = new FormData();
        formData.append("headerText", headerText);
        formData.append("subHeaderText", subHeaderText);
        formData.append("bodyText", bodyText);
        formData.append("showPopup", String(showPopup));

        const bannerMetadata = updatedBanners.map(b => ({
          id: b.id.startsWith('temp-') ? null : b.id,
          url: b.url,
          active: b.active,
          isNewFile: !!b.file
        }));
        formData.append("bannerData", JSON.stringify(bannerMetadata));

        updatedBanners.forEach(b => {
          if (b.file) formData.append("bannerFiles", b.file);
        });

        if (newPopupFile) formData.append("popupImage", newPopupFile);

        const res = await fetch(`${API_URL}/home-content`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error("Failed");

        setBanners(updatedBanners);
        await MySwal.fire({ title: 'ลบสำเร็จ', icon: 'success', showConfirmButton: true, confirmButtonColor: '#2563eb', confirmButtonText: 'OK', timer: 1500 });

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

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
    const copyListItems = [...banners];
    const dragItemContent = copyListItems[dragItem.current!];
    copyListItems.splice(dragItem.current!, 1);
    copyListItems.splice(dragOverItem.current!, 0, dragItemContent);
    dragItem.current = index;
    setBanners(copyListItems);
  };
  const handleDragEnd = () => { dragItem.current = null; dragOverItem.current = null; };

  const handleSave = async () => {
    if (!API_URL) return;
    MySwal.fire({ title: 'กำลังบันทึก...', text: 'กรุณารอสักครู่ ห้ามปิดหน้าต่างนี้', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

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
        if (b.file) formData.append("bannerFiles", b.file);
      });

      if (newPopupFile) formData.append("popupImage", newPopupFile);

      const res = await fetch(`${API_URL}/home-content`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error("Failed");

      await MySwal.fire({ title: 'สำเร็จ!', text: 'บันทึกข้อมูลหน้าแรกเรียบร้อยแล้ว', icon: 'success', confirmButtonColor: '#2563eb', confirmButtonText: 'ตกลง' });
      window.location.reload();
    } catch (error) {
      console.error(error);
      await MySwal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่', icon: 'error', confirmButtonText: 'ปิด' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>จัดการหน้าแรก</h2>
          <p className={styles.breadcrumb}>จัดการเว็บไซต์ / <span className="text-blue-600 font-medium">เนื้อหาหน้าแรก</span></p>
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
            <div className={styles.iconBox} style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <ImageIcon size={24} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Banner Slideshow</h3>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
                ลากรูปเพื่อเปลี่ยนลำดับ • คลิกไอคอนดินสอเพื่อเปลี่ยนรูป
              </p>
            </div>
          </div>

          <div className={styles.uploadArea} style={{ marginBottom: '1.5rem' }}>
            <label style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={32} />
              <span style={{ fontWeight: 600, marginTop: '0.5rem' }}>คลิกเพื่อเพิ่มรูป Banner ใหม่</span>
              {/* 🔥 เปลี่ยนเป็นรับทีละไฟล์ และเรียก onSelectFile (ไม่มี multiple แล้ว) */}
              <input type="file" hidden accept="image/*" onChange={(e) => onSelectFile(e, 'add')} />
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
                  <GripVertical size={14} style={{ marginRight: '4px' }} />
                  ลำดับที่ {index + 1}
                </div>

                <img src={banner.url} className={styles.bannerImage} draggable={false} />

                <div className={styles.bannerControls}>
                  <label className={styles.statusToggle}>
                    <div className={styles.switch}>
                      <input type="checkbox" checked={banner.active} onChange={() => handleToggleBanner(index)} />
                      <span className={styles.slider}></span>
                    </div>
                    <span style={{ fontSize: '0.8rem', marginLeft: '6px' }}>
                      {banner.active ? 'แสดง' : 'ซ่อน'}
                    </span>
                  </label>

                  <div style={{ display: 'flex' }}>
                    <label className={styles.editBtn} title="เปลี่ยนรูป">
                      <Edit size={18} />
                      {/* 🔥 เปลี่ยนรูปเดิม ก็เรียกใช้ onSelectFile */}
                      <input type="file" hidden accept="image/*" onChange={(e) => onSelectFile(e, 'edit', index)} />
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
            <div className={styles.iconBox} style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              <Type size={24} />
            </div>
            <h3 className={styles.cardTitle}>ข้อความต้อนรับบนภาพ</h3>
          </div>
          <div className={styles.inputGroup}>
            <Editor
              variant="essential"
              value={headerText}
              onChange={setHeaderText}
              placeholder="พิมพ์ข้อความที่ต้องการให้แสดงบนภาพแบนเนอร์ (สามารถจัดรูปแบบหลายบรรทัดได้ที่นี่)..."
            />
          </div>
        </div>

        {/* Popup Section */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconBox} style={{ backgroundColor: '#faf5ff', color: '#9333ea' }}>
              <MessageSquare size={24} />
            </div>
            <h3 className={styles.cardTitle}>Popup ข่าวสาร</h3>
            <div style={{ marginLeft: 'auto' }}>
              <label className={styles.statusToggle}>
                <span style={{ marginRight: '10px' }}>เปิดใช้งาน:</span>
                <div className={styles.switch}>
                  <input type="checkbox" checked={showPopup} onChange={e => setShowPopup(e.target.checked)} />
                  <span className={styles.slider}></span>
                </div>
              </label>
            </div>
          </div>
          <div onClick={() => popupInputRef.current?.click()} className={styles.uploadArea} style={{ opacity: showPopup ? 1 : 0.5 }}>
            {(popupPreview || popupUrl) ? (
              <img src={popupPreview || popupUrl} style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain' }} />
            ) : (
              <>
                <MonitorPlay size={32} className="mb-2 opacity-50" />
                <span>คลิกอัปโหลด Popup</span>
              </>
            )}
            <input type="file" ref={popupInputRef} hidden accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) { setNewPopupFile(file); setPopupPreview(URL.createObjectURL(file)); }
            }} />
          </div>
        </div>

      </div>

      {/* 🔥 ส่วนของ Modal Crop รูปภาพ (เพิ่มเข้ามาใหม่) */}
      {isCropping && imageToCrop && (
        <div className={styles.cropModalOverlay}>
          <div className={styles.cropModalContent}>

            {/* พื้นที่ครอปรูป */}
            <div className={styles.cropperContainer}>
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={21 / 9} // สัดส่วน Banner 21:9 (สามารถแก้เป็น 16/9 หรืออื่นๆ ได้)
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* เครื่องมือซูมและปุ่มกดยืนยัน */}
            <div className={styles.cropControls}>
              <div className={styles.zoomSliderContainer}>
                <ZoomOut size={20} color="#9ca3af" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className={styles.zoomSlider}
                />
                <ZoomIn size={20} color="#9ca3af" />
              </div>

              <div className={styles.cropActions}>
                <button onClick={() => setIsCropping(false)} className={styles.btnCropCancel}>
                  ยกเลิก
                </button>
                <button onClick={handleConfirmCrop} className={styles.btnCropConfirm}>
                  ครอปและบันทึก
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}