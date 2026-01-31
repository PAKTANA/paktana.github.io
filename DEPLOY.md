# วิธีการนำเว็บไซต์ขึ้นใช้งานจริง (Deployment)

เนื่องจากเราได้ทำการซ่อนไฟล์ `assets/js/config.js` ไว้ (ไม่ให้อยู่ใน Git) ดังนั้นเวลาคุณนำเว็บไซต์ขึ้นระบบ (Deploy) คุณต้องสร้างไฟล์นี้ขึ้นมาใหม่อีกครั้งใน Server ปลายทาง วิธีการจะขึ้นอยู่กับว่าคุณใช้วิธีไหนครับ

---

## แบบที่ 1: ใช้ Netlify / Vercel (แนะนำ - ง่ายที่สุด)

หากคุณเชื่อมต่อกับ GitHub เพื่อ Deploy อัตโนมัติ:

1. **ตั้งค่า Environment Variables** ในหน้า Dashboard ของ Netlify หรือ Vercel:
   - ไปที่ `Settings` > `Environment Variables`
   - เพิ่มตัวแปรชื่อ `SUPABASE_URL` ใส่ค่า URL ของคุณ
   - เพิ่มตัวแปรชื่อ `SUPABASE_ANON_KEY` ใส่ค่า KEY ของคุณ

2. **ตั้งค่า Build Command:**
   เนื่องจากไฟล์ config.js ไม่มีอยู่จริง เราต้องสั่งให้สร้างมันขึ้นมาตอน Deploy
   - **Build Command:** 
     ```bash
     echo "window.ENV = { SUPABASE_URL: '$SUPABASE_URL', SUPABASE_ANON_KEY: '$SUPABASE_ANON_KEY' };" > assets/js/config.js
     ```
   - **Publish Directory:** `.` (หรือ root)

---

## แบบที่ 2: ใช้ Drag & Drop (Netlify Drop)

1. ในเครื่องคอมพิวเตอร์ของคุณ ให้แน่ใจว่ามีไฟล์ `assets/js/config.js` อยู่แล้ว และข้อมูลถูกต้อง
2. ลาก **ทั้งโฟลเดอร์โปรเจกต์** ไปวางในหน้า [Netlify Drop](https://app.netlify.com/drop)
3. ระบบจะอัปโหลดทุกไฟล์รวมถึง config.js ขึ้นไปให้เอง วิธีนี้ง่ายที่สุดแต่ต้องทำใหม่ทุกครั้งที่อัปเดตเว็บ

---

## แบบที่ 3: ใช้ Web Hosting ธรรมดา (FTP/cPanel)

1. อัปโหลดไฟล์ทั้งหมดขึ้น Server ตามปกติ
2. **อย่าลืม!** อัปโหลดไฟล์ `assets/js/config.js` ขึ้นไปไว้ในโฟลเดอร์ `assets/js/` บน Server ด้วย (เพราะไฟล์นี้อาจไม่ติดไปถ้าคุณ zip มาจาก Git repository เปล่าๆ)

---

## ข้อควรระวังเรื่องความปลอดภัย
แม้เราจะซ่อน KEY จาก GitHub (Code) ได้ แต่เมื่อเว็บไซต์ทำงานอยู่บนหน้าเว็บ (Browser) **ผู้ใช้งานที่มีความรู้เทคนิคยังสามารถกด F12 เพื่อดู KEY ได้อยู่ดี**

นี่คือเรื่องปกติของ "Static Website" (เว็บที่มีแต่ HTML/JS) ครับ
*   **Supabase Anon Key** ออกแบบมาให้เปิดเผยได้ (Safe to expose) ตราบใดที่คุณตั้งค่า **RLS (Row Level Security)** ใน Supabase ไว้ดีแล้ว (เช่น อนุญาตให้อ่านได้ทุกคน แต่แก้ไขได้เฉพาะ Admin)
*   **ห้าม** เอา `SERVICE_ROLE_KEY` (Key ลับสุดยอด) มาใส่ในไฟล์นี้เด็ดขาด! ใช้แค่ `ANON_KEY` เท่านั้นครับ
