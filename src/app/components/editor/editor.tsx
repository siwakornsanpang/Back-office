'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import styles from './editor.module.css';
import Swal from 'sweetalert2';

const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <p className="p-4 text-gray-500">Loading Editor...</p>,
}) as any;

interface EditorProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function Editor({ label, value, onChange, placeholder }: EditorProps) {
    const quillRef = useRef<any>(null);

    // ✅ ฟังก์ชันอัปโหลดรูป (ยิงไป Backend ทันทีที่เลือกไฟล์)
    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                const formData = new FormData();
                formData.append('file', file); // key ต้องตรงกับที่ backend รับ (req.file())

                // Show loading
                Swal.fire({
                    title: 'กำลังอัปโหลดรูป...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                try {
                    // ยิงไปที่ Route ใหม่ที่เราเพิ่งสร้าง
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/upload-image`, {
                        method: 'POST',
                        body: formData, // Browser จัดการ Content-Type ให้เอง
                    });

                    if (!res.ok) throw new Error('Upload failed');

                    const data = await res.json();
                    const url = data.url;

                    Swal.close();

                    // แทรกรูปลงใน Editor
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection();
                    quill.insertEmbed(range ? range.index : 0, 'image', url);

                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', 'อัปโหลดรูปไม่สำเร็จ', 'error');
                }
            }
        };
    }, []);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image', 'video'], // ✅ มีปุ่ม Image
                ['clean']
            ],
            handlers: {
                image: imageHandler // ✅ ผูก Handler
            }
        }
    }), [imageHandler]);

    return (
        <div className={styles.container}>
            {label && <label className={styles.label}>{label}</label>}
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder}
                className={styles.quillEditor}
            />
        </div>
    );
}