'use client';

import { useLayoutEffect, useRef } from 'react';

/** Keep the visible page in place when ordering expands the paginated table. */
export default function useAcademyOrderAnchor(items: readonly { id: number }[]) {
  const anchor = useRef<{ id: string; top: number } | null>(null);
  useLayoutEffect(() => {
    if (!anchor.current) return;
    const { id, top } = anchor.current;
    anchor.current = null;
    const row = document.querySelector<HTMLElement>(`[data-academy-order-row="${id}"]`);
    if (row) window.scrollBy({ top: row.getBoundingClientRect().top - top, behavior: 'instant' });
  }, [items]);
  return (excluded: number[]) => {
    const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-academy-order-row]'));
    const eligible = rows.filter(item => !excluded.includes(Number(item.dataset.academyOrderRow)));
    const row = eligible.find(item => { const rect = item.getBoundingClientRect(); return rect.bottom > 0 && rect.top < window.innerHeight; }) || eligible[0] || rows[0];
    if (row) anchor.current = { id: row.dataset.academyOrderRow!, top: row.getBoundingClientRect().top };
  };
}
