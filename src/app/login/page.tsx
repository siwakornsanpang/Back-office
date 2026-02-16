// src/app/login/page.tsx
"use client";

import Cookies from 'js-cookie';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
// import Image from 'next/image'; 


// ✅ Import Styles
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const router = useRouter();
  
  // States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Function Login จำลอง
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API Call (หน่วงเวลา 1.5 วิ)
    setTimeout(() => {
      // Logic ตรวจสอบเบื้องต้น
      if (username === 'admin' && password === '1234') {
        
        // ✅ สร้าง Cookie
        Cookies.set('auth_token', 'mock-token-123456', { expires: 1, path: '/' });

        // ไปหน้า Backoffice
        router.push('/backoffice'); 
        
      } else {
        setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className={styles.container}>
      
      {/* Login Card */}
      <div className={styles.card}>
        
        {/* Header */}
        <div className={styles.header}>
            <div className={styles.logoBox}>
                <img src={"/favicon.ico"}></img>
            </div>
            <h2 className={styles.title}>ยินดีต้อนรับ</h2>
            <p className={styles.subtitle}>เข้าสู่ระบบ PharmacyOne</p>
        </div>

        {/* Form Input */}
        <div className={styles.formContainer}>
          <form onSubmit={handleLogin} className={styles.form}>
            
            {/* Username Input */}
            <div className={styles.formGroup}>
              <label className={styles.label}>ชื่อผู้ใช้งาน</label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className={styles.inputField}
                  placeholder="กรอกชื่อผู้ใช้งาน"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className={styles.formGroup}>
              <label className={styles.label}>รหัสผ่าน</label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className={`${styles.inputField} pr-10`} /* pr-10 เผื่อที่ให้ปุ่มตา */
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* ปุ่มลูกตา Show/Hide Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className={styles.optionsRow}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkbox} />
                <span>จำรหัสผ่าน</span>
              </label>
              <a href="#" className={styles.link}>
                ลืมรหัสผ่าน?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                 <span>⚠️ {error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`${styles.submitButton} ${isLoading ? styles.loadingBtn : styles.activeBtn}`}
            >
              {isLoading ? (
                <>กำลังเข้าสู่ระบบ...</> 
              ) : (
                <> <LogIn size={18} /> เข้าสู่ระบบ </>
              )}
            </button>

          </form>
        </div>
        
        {/* Footer */}
        <div className={styles.footer}>
         &copy; สำนักงานเลขาธิการ สภาเภสัชกรรม อาคารมหิตลาธิเบศร
        </div>

      </div>
    </div>
  );
}