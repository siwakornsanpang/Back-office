'use client';

import { useId } from 'react';
import { useAcademyFieldValidation } from './AcademyForm';
import styles from './AcademyFields.module.css';

export default function AcademyColorField({ label = 'สีป้าย', value, onChange, disabled = false }: { label?: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const id = useId();
  const { error, clear } = useAcademyFieldValidation(`${id}-hex`);
  const valid = /^#[0-9a-f]{6}$/i.test(value);
  return <div className={styles.colorField}>
    <label htmlFor={`${id}-hex`}>{label}<span aria-hidden="true"> *</span></label>
    <div className={styles.colorInputs}>
      <input className={styles.swatch} type="color" aria-label={`เลือก${label}`} value={valid ? value : '#737300'} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
      <input id={`${id}-hex`} aria-label={label} type="text" value={value} onChange={(event) => { onChange(event.target.value); clear(); }} aria-invalid={Boolean(error)} disabled={disabled} required pattern="#[0-9a-fA-F]{6}" maxLength={7} placeholder="#737300" aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`} title="กรอกสี HEX ในรูปแบบ #RRGGBB เช่น #000000" spellCheck={false} />
    </div>
    {error && <small id={`${id}-error`} role="alert" className={styles.fieldError}>{error}</small>}
    <small id={`${id}-hint`} className={styles.hint}>เลือกสีหรือกรอก HEX เช่น #000000</small>
  </div>;
}
