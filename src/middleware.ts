// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  
  // 1. ตรวจสอบว่ามี "บัตรผ่าน" (Cookie) ที่ชื่อ 'auth_token' ไหม?
  const token = request.cookies.get('auth_token')?.value

  // 2. ตรวจสอบว่า User กำลังจะเข้าโซนหวงห้ามไหม? (ขึ้นต้นด้วย /backoffice)
  const isProtectPath = request.nextUrl.pathname.startsWith('/backoffice')

  // 3. กฎเหล็ก: ถ้าจะเข้าโซนหวงห้าม แต่ไม่มีบัตรผ่าน -> ถีบกลับไปหน้า Login
  if (isProtectPath && !token) {
    // จำ URL เดิมไว้ด้วย (เผื่อ Login เสร็จจะส่งกลับมาที่เดิม)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. (แถม) ถ้ามีบัตรแล้ว แต่พยายามจะเข้าหน้า Login -> ถีบเข้า Backoffice เลย (ไม่ต้อง Login ซ้ำ)
  if (request.nextUrl.pathname === '/login' && token) {
     return NextResponse.redirect(new URL('/backoffice', request.url))
  }

  // ถ้าผ่านทุกเงื่อนไข ก็เชิญเข้าได้
  return NextResponse.next()
}

// กำหนดว่า Middleware นี้จะทำงานกับเส้นทางไหนบ้าง
export const config = {
  // บังคับใช้กับ /backoffice ทุกหน้า และหน้า /login
  matcher: ['/backoffice/:path*', '/login'],
}