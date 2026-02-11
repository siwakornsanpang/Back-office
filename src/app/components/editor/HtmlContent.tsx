'use client';

import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
// [สำคัญ] Import CSS ของ Quill เพื่อให้จัดรูปแบบเหมือนตอนพิมพ์เป๊ะๆ
import 'react-quill-new/dist/quill.snow.css';

interface HtmlContentProps {
    content: string;
    className?: string;
}

export default function HtmlContent({ content, className = '' }: HtmlContentProps) {
    // 1. ทำความสะอาด HTML (ลบ script อันตรายออก)
    const cleanContent = DOMPurify.sanitize(content);

    return (
        // 2. ใช้ ql-snow และ ql-editor เพื่อดึง Style ของ Quill มาใช้
        <div className={`ql-snow ${className}`}>
            <div
                className="ql-editor"
                style={{ padding: 0, overflow: 'visible' }} // ปรับ CSS นิดหน่อยให้เหมาะกับการอ่าน
                dangerouslySetInnerHTML={{ __html: cleanContent }}
            />
        </div>
    );
}