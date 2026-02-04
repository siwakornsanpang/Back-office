// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบสำนักงานเลขธิการ",
  description: "ระบบสำนักงานเลขธิการ สภาเภสัชกรรม",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}