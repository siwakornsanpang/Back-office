'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';
import styles from './academyOrder.module.css';

export function moveAcademyItem<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length || from === to) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function AcademyReorderButtons({ label, index, count, disabled = false, onMove }: {
  label: string; index: number; count: number; disabled?: boolean; onMove: (to: number) => void;
}) {
  return <span className={styles.buttons}>
    <button type="button" className={styles.button} disabled={disabled || index === 0} aria-label={`เลื่อน${label}ขึ้น`} title="เลื่อนขึ้น" onClick={() => onMove(index - 1)}><ArrowUp size={16} aria-hidden="true" /></button>
    <button type="button" className={styles.button} disabled={disabled || index === count - 1} aria-label={`เลื่อน${label}ลง`} title="เลื่อนลง" onClick={() => onMove(index + 1)}><ArrowDown size={16} aria-hidden="true" /></button>
  </span>;
}
