'use client';

import React from 'react';
import styles from '@/app/backoffice/module/web/about/council/council.module.css';

interface CrudModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  maxWidth?: string;
}

/**
 * Shared CRUD Modal Shell
 * ใช้แทน modal overlay + header + form ที่ซ้ำกันทุกหน้า CRUD
 */
export default function CrudModal({ isOpen, title, onClose, onSubmit, children, maxWidth }: CrudModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox} style={maxWidth ? { maxWidth } : undefined}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button onClick={onClose} className={styles.btnClose}>✕</button>
        </div>
        <form onSubmit={onSubmit} className={styles.modalBody}>
          {children}
          <div style={{ paddingTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className={styles.btnCancel}>ยกเลิก</button>
            <button type="submit" className={styles.btnSubmit}>บันทึกข้อมูล</button>
          </div>
        </form>
      </div>
    </div>
  );
}
