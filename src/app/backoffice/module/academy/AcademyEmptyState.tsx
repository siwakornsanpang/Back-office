import type { ReactNode } from 'react';
import { CircleAlert, Inbox, LoaderCircle } from 'lucide-react';
import styles from './academy.module.css';

export default function AcademyEmptyState({ title, hint, state = 'ready', action }: { title: string; hint: string; state?: 'loading' | 'ready' | 'error'; action?: ReactNode }) {
  return <div className={styles.emptyState} role={state === 'error' ? 'alert' : 'status'}>
    {state === 'loading' ? <LoaderCircle className={`${styles.emptyIcon} ${styles.loadingIcon}`} size={34} strokeWidth={1.5} aria-hidden="true" />
      : state === 'error' ? <CircleAlert className={styles.emptyIcon} size={34} strokeWidth={1.5} aria-hidden="true" />
      : <Inbox className={styles.emptyIcon} size={34} strokeWidth={1.5} aria-hidden="true" />}
    <p className={styles.emptyTitle}>{title}</p>
    <p className={styles.emptyHint}>{hint}</p>
    {state !== 'loading' && action}
  </div>;
}
