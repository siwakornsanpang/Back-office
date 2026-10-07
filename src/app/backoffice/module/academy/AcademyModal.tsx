'use client';

import { ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './academy.module.css';

export default function AcademyModal({ open, title, titleId, saving, onClose, children }: { open: boolean; title: string; titleId: string; saving: boolean; onClose: () => void; children: ReactNode }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const savingRef = useRef(saving);
  const closeRef = useRef(onClose);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => { savingRef.current = saving; closeRef.current = onClose; }, [saving, onClose]);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = dialogRef.current;
    const isTopDialog = () => Array.from(document.querySelectorAll('[data-academy-modal]')).at(-1) === dialog;
    const focusables = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') || []).filter(element => !element.hidden && !element.closest('[hidden]'));
    (dialog?.querySelector<HTMLElement>('input:not(:disabled), select:not(:disabled), textarea:not(:disabled)') || focusables()[0] || dialog)?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTopDialog() || document.querySelector('.swal2-container')) return;
      if (event.key === 'Escape' && !savingRef.current) { event.preventDefault(); closeRef.current(); }
      if (event.key === 'Tab') {
        const targets = focusables();
        if (!targets.length) { event.preventDefault(); dialog?.focus(); return; }
        const first = targets[0], last = targets[targets.length - 1];
        if (event.shiftKey && (document.activeElement === first || !dialog?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !dialog?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    };
    const keepFocus = (event: FocusEvent) => {
      if (isTopDialog() && !document.querySelector('.swal2-container') && !dialog?.contains(event.target as Node)) (focusables()[0] || dialog)?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', keepFocus);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', keepFocus);
      document.body.style.overflow = previousOverflow;
      if (savingRef.current) restoreFocusRef.current = previousFocus;
      else previousFocus?.focus();
    };
  }, [open]);
  useEffect(() => {
    if (!saving && !open && restoreFocusRef.current) { restoreFocusRef.current.focus(); restoreFocusRef.current = null; }
  }, [saving, open]);
  if (!open) return null;
  return createPortal(<div className={styles.modalBackdrop}><div className={styles.modalPanel} ref={dialogRef} data-academy-modal tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId}>
    <div className={styles.modalHeader}><h2 id={titleId} className={styles.modalTitle}>{title}</h2><button className={styles.modalClose} type="button" aria-label="ปิดหน้าต่าง" disabled={saving} onClick={onClose}>×</button></div>
    {children}
  </div></div>, document.body);
}
