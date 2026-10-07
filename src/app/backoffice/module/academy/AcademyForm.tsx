'use client';

import { Children, cloneElement, createContext, isValidElement, useContext, useId, useState, type FormHTMLAttributes, type InputHTMLAttributes, type ReactElement, type ReactNode } from 'react';
import styles from './academyForms.module.css';

const Validation = createContext<{ errors: Record<string, string>; clear: (id: string) => void }>({ errors: {}, clear: () => {} });

export function useAcademyFieldValidation(id: string) {
  const { errors, clear } = useContext(Validation);
  return { error: errors[id], clear: () => clear(id) };
}

export default function AcademyForm({ children, onSubmit, ...props }: FormHTMLAttributes<HTMLFormElement>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  return <Validation.Provider value={{ errors, clear: id => setErrors(current => { const next = { ...current }; delete next[id]; return next; }) }}>
    <form {...props} noValidate onSubmit={event => {
      const next: Record<string, string> = {};
      let first: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | undefined;
      for (const field of Array.from(event.currentTarget.elements)) {
        if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) || field.disabled || !field.willValidate) continue;
        const missing = field.required && !field.value.trim();
        if (!missing && field.validity.valid) continue;
        const message = missing || field.validity.valueMissing ? 'กรุณากรอกข้อมูลช่องนี้' : field.validity.patternMismatch ? 'กรุณากรอกตามรูปแบบที่ระบุ' : field.validity.rangeUnderflow ? `ค่าต้องไม่น้อยกว่า ${field instanceof HTMLInputElement ? field.min : ''}` : field.validity.rangeOverflow ? `ค่าต้องไม่เกิน ${field instanceof HTMLInputElement ? field.max : ''}` : 'กรุณาตรวจสอบค่าที่กรอก';
        next[field.id] = message;
        first ??= field;
      }
      setErrors(next);
      if (first) { event.preventDefault(); first.focus(); first.scrollIntoView?.({ block: 'center', behavior: 'smooth' }); return; }
      onSubmit?.(event);
    }}>{children}</form>
  </Validation.Provider>;
}

export function AcademyField({ label, children }: { label: string; children: ReactNode }) {
  const generatedId = useId();
  const { errors, clear } = useContext(Validation);
  const nodes = Children.toArray(children);
  const field = nodes.find(child => isValidElement(child) && ['input', 'select', 'textarea'].includes(String(child.type))) as ReactElement<InputHTMLAttributes<HTMLInputElement>> | undefined;
  if (!field) return <label>{label}{children}</label>;
  const id = field.props.id || generatedId;
  const errorId = `${id}-error`;
  const required = Boolean(field.props.required);
  return <label htmlFor={id}>
    <span>{label}{required && <span className={styles.required} aria-hidden="true"> *</span>}</span>
    {nodes.map(child => child === field ? cloneElement(field, {
      id, 'aria-label': field.props['aria-label'] || label.replace(/\s*\*$/, ''), 'aria-invalid': Boolean(errors[id]),
      'aria-describedby': [field.props['aria-describedby'], errors[id] ? errorId : null].filter(Boolean).join(' ') || undefined,
      onChange: event => { field.props.onChange?.(event); clear(id); },
    }) : child)}
    {errors[id] && <small id={errorId} className={styles.fieldError} role="alert">{errors[id]}</small>}
  </label>;
}
