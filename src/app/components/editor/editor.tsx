'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// [1] เปลี่ยน path css เป็นของ react-quill-new
import 'react-quill-new/dist/quill.snow.css';

import styles from './editor.module.css';

// [2] เปลี่ยน library ที่ import ตรงนี้
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <p className={styles.loading}>กำลังโหลด...</p>,
});

interface EditorProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function Editor({ label, value, onChange, placeholder }: EditorProps) {

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike', { 'color': [] }],
            [{ 'align': [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image', 'video'],          
            [{ header: [1, 2, 3, false] }],
            ['blockquote', 'code-block'],
            ['clean'], 
        ],
    };

    return (
        <div className={styles.container}>
            {label && <label className={styles.label}>{label}</label>}
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder}
            />
        </div>
    );
}