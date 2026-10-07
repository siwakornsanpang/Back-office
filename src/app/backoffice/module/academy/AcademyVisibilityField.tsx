'use client';

import styles from './AcademyFields.module.css';

export default function AcademyVisibilityField({ checked, onChange, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return <label className={styles.visibility}>
    <span><span className={styles.label}>แสดงบนหน้าเว็บ</span><small className={styles.hint}>{checked ? 'ผู้เข้าชมสามารถเห็นรายการนี้บนหน้า Academy' : 'ซ่อนรายการนี้จากผู้เข้าชมหน้า Academy'}</small></span>
    <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
  </label>;
}
