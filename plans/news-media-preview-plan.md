# 📋 แผนพัฒนา News Media Management & Preview System

## 1. ระบบจัดการรูปภาพ (Image Management)

เป้าหมายคือการทำให้ Admin สามารถอัปโหลดรูปภาพหน้าปก และแทรกรูปภาพประกอบในเนื้อหาข่าวได้อย่างอิสระ

### 📸 ส่วนที่ 1: รูปภาพหน้าปก (Cover Image)

* **Feature:** เพิ่มช่องสำหรับอัปโหลด Image Placeholder ที่ด้านบนของฟอร์ม
* **Storage:** จัดเก็บรูปภาพผ่าน Cloud Storage (เช่น Firebase Storage, AWS S3 หรือ Supabase Storage) แทนการเก็บลงฐานข้อมูลโดยตรงเพื่อความรวดเร็ว
* **Preview:** แสดงรูปตัวอย่างทันทีที่เลือกไฟล์ (Instant Thumbnail Preview) พร้อมปุ่มลบ/เปลี่ยนรูป

### 🖼️ ส่วนที่ 2: รูปภาพในเนื้อหา (Editor Integration)

* **Feature:** ปรับปรุง `Editor` (React Quill) ให้รองรับการ "ลากและวาง" (Drag & Drop) รูปภาพ
* **Image Resizing:** เพิ่มโมดูลให้ Admin สามารถคลิกที่รูปเพื่อปรับขนาด (Small, Medium, Full) และจัดตำแหน่ง (ซ้าย, กลาง, ขวา) ได้ในหน้า Editor

---

## 2. ระบบพรีวิวข่าว (News Preview System)

เป้าหมายคือให้ Admin เห็นหน้าตาข่าวที่ "เหมือนจริง" ก่อนที่จะกดเผยแพร่สู่สาธารณะ

### 🔍 ฟีเจอร์พรีวิว (Preview Workflows)

* **Live Preview Window:** เพิ่มปุ่ม **"เปิดหน้าพรีวิว"** ในหน้า Create/Edit ซึ่งจะเปิดหน้าต่างใหม่ (New Tab) เพื่อแสดงเนื้อหาข่าวใน Layout เดียวกับหน้าเว็บไซต์จริง (Public Site)
* **Responsive Check:** ในหน้าพรีวิวจะสามารถเลือกดูได้ทั้งมุมมอง Desktop, Tablet และ Mobile
* **Draft Preview:** สามารถพรีวิวข่าวที่มีสถานะเป็น `Draft` (ฉบับร่าง) ได้โดยที่บุคคลภายนอกยังมองไม่เห็น

---

## 📅 Roadmap การดำเนินการ (Implementation Steps)

### ระยะที่ 1: เพิ่มช่องอัปโหลดรูปหน้าปก (High Priority)

* สร้าง Component `ImageUpload` ที่รองรับการ Drop ไฟล์
* เชื่อมต่อ API เพื่อส่งไฟล์รูปไปยัง Server และรับ URL กลับมาเก็บใน Field `thumbnailUrl`

### ระยะที่ 2: พัฒนาหน้าพรีวิว (Medium Priority)

* สร้าง Route ใหม่ `/backoffice/module/web/news/preview`
* พัฒนาหน้าพรีวิวที่ดึง CSS จากหน้าบ้าน (Frontend) มาใช้งาน เพื่อให้การแสดงผลแม่นยำ 100%

### ระยะที่ 3: ปรับปรุง Rich Text Editor (Advanced)

* ติดตั้ง Plugin สำหรับจัดการรูปภาพใน Editor
* ทำระบบให้รูปที่ใส่ในเนื้อหาถูกเก็บเป็น URL แทนการเก็บเป็น Base64 (เพื่อป้องกันฐานข้อมูลบวม)

---

### 🛠️ เทคโนโลยีที่แนะนำ

* **Storage:** Cloudinary หรือ Firebase Storage (ใช้งานง่ายสำหรับโปรเจกต์ Next.js)
* **Image Library:** `react-dropzone` สำหรับการเลือกไฟล์
* **Visuals:** `framer-motion` สำหรับเอฟเฟกต์การพรีวิวที่ดูลื่นไหล
