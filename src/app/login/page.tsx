// src/app/login/page.tsx
"use client";

import Cookies from 'js-cookie';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import Image from 'next/image'; // เผื่อใส่ Logo

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
        
        // ✅ [เติมตรงนี้] สร้าง Cookie ชื่อ 'auth_token' (เปรียบเสมือนบัตรผ่าน)
        // expires: 1 คืออยู่ได้ 1 วัน, path: '/' คือใช้ได้ทั้งเว็บ
        Cookies.set('auth_token', 'mock-token-123456', { expires: 1, path: '/' });

        // หลังจากได้บัตรแล้ว ค่อยเชิญไปหน้า Backoffice
        router.push('/backoffice'); 
        
      } else {
        setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 p-4">
      
      {/* Login Card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header ส่วนหัวการ์ด */}
        <div className="bg-gray-50 p-8 text-center border-b border-gray-100">
            {/* ใส่ Logo ตรงนี้ได้ */}
            <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 text-white font-bold text-2xl shadow-lg">
                B
            </div>
            <h2 className="text-2xl font-bold text-gray-800">ยินดีต้อนรับ</h2>
            <p className="text-gray-500 text-sm mt-1">เข้าสู่ระบบ BackOffice Management</p>
        </div>

        {/* Form Input */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้งาน</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="กรอกชื่อผู้ใช้งาน"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* ปุ่มลูกตา Show/Hide Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-gray-600">จำรหัสผ่าน</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                ลืมรหัสผ่าน?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                 <span>⚠️ {error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-2.5 rounded-lg text-white font-medium shadow-md transition-all flex items-center justify-center gap-2
                ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}
              `}
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
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100">
         
        </div>

      </div>
    </div>
  );
}