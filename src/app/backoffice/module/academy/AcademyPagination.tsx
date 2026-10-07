'use client';

import { Fragment } from 'react';
import styles from './academy.module.css';

export default function AcademyPagination({ page, total, pageSize, onPageChange, itemLabel }: {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel: string;
}) {
  if (total === 0) return null;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const numbers = Array.from({ length: pages }, (_, index) => index + 1)
    .filter((number) => number === 1 || number === pages || Math.abs(number - page) <= 2);
  return <nav className={styles.pager} aria-label="แบ่งหน้า">
    <span className={styles.pageInfo}>แสดง {(page - 1) * pageSize + 1} ถึง {Math.min(page * pageSize, total)} จากทั้งหมด {total} {itemLabel}</span>
    <div className={styles.pageControls}>
    <button className={styles.pageBtn} type="button" disabled={page <= 1} aria-label="หน้าก่อนหน้า" onClick={() => onPageChange(page - 1)}>&lt;</button>
    {numbers.map((number, index) => <Fragment key={number}>
      {index > 0 && number - numbers[index - 1] > 1 && <span className={styles.pageEllipsis} aria-hidden="true">…</span>}
      <button className={`${styles.pageBtn} ${page === number ? styles.pageBtnActive : ''}`} type="button" aria-label={`หน้า ${number}`} aria-current={page === number ? 'page' : undefined} onClick={() => onPageChange(number)}>{number}</button>
    </Fragment>)}
    <button className={styles.pageBtn} type="button" disabled={page >= pages} aria-label="หน้าถัดไป" onClick={() => onPageChange(page + 1)}>&gt;</button>
    </div>
  </nav>;
}
