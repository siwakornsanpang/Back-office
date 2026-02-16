---
name: Backoffice sprint roadmap
overview: Roadmap แบบ MVP (mock/localStorage) สำหรับ Backoffice สภาเภสัชกรรม ตาม 5 โมดูลในแพลนเก่า + โครงเมนูในโค้ดปัจจุบัน โดยจัดเป็นสปรินต์เพื่อเริ่มทำจากหน้า/โมดูลที่เห็นผลเร็วที่สุด.
todos:
  - id: s0-auth-guard
    content: ทำ login/session แบบ MVP และ guard `/backoffice/*`
    status: pending
  - id: s1-cms-news
    content: ทำ CMS ข่าวประชาสัมพันธ์ (CRUD + year/order + status draft/publish) ด้วย localStorage
    status: pending
  - id: s2-cms-banner-about
    content: ทำ CMS banner + about (ทำเนียบสภา/กรรมการ) ด้วย localStorage
    status: pending
  - id: s3-register-core
    content: ทำทะเบียนเภสัชกร (CRUD + search) และเลื่อน map ไป Phase 2
    status: pending
  - id: s4-eservice-inbox
    content: ทำ E‑Service inbox + statuses + ขอข้อมูลเพิ่ม/ยืนยันสถานะ (mock)
    status: pending
  - id: s5-meeting-and-bill-mock
    content: เพิ่มโมดูลประชุม (create/manage) + หน้า transaction mock ใน bill
    status: pending
isProject: false
---

# Backoffice sprint roadmap (MVP: mock/localStorage)

## Requirement หลัก (จากแพลนเก่า)

- **Module1 CMS**: Home banner, About (ทำเนียบสภา/กรรมการ), News (ปี+ลำดับประกาศ), Service CRUD, Agency, Law (6 หมวดย่อย)
- **Module2 ประชุม**: สร้างงานประชุม + จัดการงานประชุม
- **Module3 ทะเบียนเภสัชกร**: รายการ+ค้นหา+CRUD และหน้า map (ทำทีหลัง)
- **Module4 E‑Service**: inbox request + สถานะ 4 แบบ + เพิ่มข่าวสาร/กิจกรรม + ยืนยันสถานะ
- **Module5 การเงิน/ธุรกรรม**: หน้า transaction (mock ก่อน), gateway จริงทำทีหลัง

## โครงในโค้ดที่ต้องยึด

- เมนูอยู่ที่ `[src/app/backoffice/layout/menuConfig.tsx](src/app/backoffice/layout/menuConfig.tsx)` และชี้ไป `/backoffice/module/...`
- หน้าโมดูลปัจจุบันอยู่ใต้ `[src/app/backoffice/module/](src/app/backoffice/module/)` (web/register/e-service/bill/setting)
- มี route ซ้ำอีกชุดที่ `[src/app/module/](src/app/module/)` (เช่น `setting/tags`) → ใน MVP ให้ **ยึด `/backoffice/module/...` เป็นหลัก** แล้วค่อยย้าย/ปรับให้เหลือชุดเดียว

## แนวทาง data (ตามที่คุณยืนยัน)

- MVP ใช้ **mock/localStorage** เป็นหลักต่อ entity (pattern เดียวกับ TagManager ที่ทำไว้)
- มี service helper กลางสำหรับ `load/save` (key ต่อโมดูล) + schema เบื้องต้น + seed data

## Sprint plan (เริ่มจากหน้าไหน / ทำอะไรบ้าง)

### Sprint0: ระบบเดินได้ (0.5–1 วัน)

- Login/Session: หน้า `[src/app/login/page.tsx](src/app/login/page.tsx)`
- Route guard สำหรับ `/backoffice/*`
- กำหนดมาตรฐาน route ให้เหลือชุดเดียว: `/backoffice/module/...`

### Sprint1: CMS ข่าวประชาสัมพันธ์ (3–5 วัน)

- เริ่มที่ `/backoffice/module/web/news`
- Deliverables:
  - List + search + filter ปี
  - Create/Edit/Delete
  - Field ขั้นต่ำ: `title`, `content`, `year`, `order`, `status(draft/published)`, `createdAt/updatedAt`
  - localStorage key: `backoffice.cms.news.v1`

### Sprint2: CMS Home banner + About (2–4 วัน)

- `/backoffice/module/web/home` (Banner)
  - CRUD + order + enable/disable
- `/backoffice/module/web/about/history` และ `/backoffice/module/web/about/council/...`
  - ทำเนียบสภา (เพิ่ม/ลด)
  - กรรมการ 24 คน แยก elected/appointed

### Sprint3: ทะเบียนเภสัชกร (3–5 วัน)

- เริ่มที่ `/backoffice/module/register`
- Deliverables:
  - List + search + CRUD เภสัชกร
  - Field ขั้นต่ำ: เลขใบ, ชื่อ, จังหวัด, สถานะใบ (active/suspended/expired)
  - **Map** ทำเป็น sprint ถัดไป (Phase 2)

### Sprint4: E‑Service (3–5 วัน)

- เริ่มที่ `/backoffice/module/e-service`
- Deliverables:
  - Inbox request (หัวข้อ + สถานะ 4 แบบ)
  - เปลี่ยนสถานะ + note “ขอข้อมูลเพิ่ม”
  - หน้าข่าวสาร/กิจกรรม (mock) ถ้าจำเป็นให้ reuse CMS News หรือทำ entity ใหม่

### Sprint5: ประชุม + การเงิน (mock) (2–4 วัน)

- **ประชุม** (เพิ่ม route ใหม่ภายใต้ `/backoffice/module/meeting` หรือผูกเข้ากับเมนูเดิมตามที่คุณต้องการ)
  - สร้างงานประชุม + จัดการงานประชุม
- **การเงิน/ธุรกรรม** `/backoffice/module/bill`
  - หน้า list transaction + filter สถานะ (mock)

## Cross-cutting ที่ทำควบคู่ (เริ่ม Sprint1)

- Permission model (mock): ใช้ `MenuItem.id` ใน `SIDEBAR_DATA` เป็น permission key แล้วเปิดใช้ filter ใน `[src/app/backoffice/layout/Sidebar.tsx](src/app/backoffice/layout/Sidebar.tsx)`
- UI components reuse: `[src/app/components/common/](src/app/components/common/)` (Table/Modal/Input/Button/Badge)

