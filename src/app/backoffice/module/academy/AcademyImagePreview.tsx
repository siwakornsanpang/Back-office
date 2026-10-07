'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import { ImageIcon } from 'lucide-react';
import styles from './academyForms.module.css';
import shared from './academy.module.css';

export default function AcademyImagePreview({ src, alt, label, cover = false, formPreview = false, className = '' }: { src?: string | null; alt: string; label?: string; cover?: boolean; formPreview?: boolean; className?: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const imageClass = `${styles.thumbnail} ${cover ? styles.cover : ''} ${formPreview ? styles.formPreview : cover ? shared.courseThumb : shared.squareThumb}`;
  if (!src || failedSource === src) return <span className={`${styles.previewButton} ${styles.emptyPreview} ${className}`}><span className={`${imageClass} ${styles.imagePlaceholder}`} role="img" aria-label={`ยังไม่มีรูป: ${alt}`}><ImageIcon aria-hidden="true" /></span></span>;
  return <button className={`${styles.previewButton} ${className}`} type="button" aria-label={`ดูรูปเต็ม: ${alt}`} onClick={() => Swal.fire({ imageUrl: src, imageAlt: alt, customClass: { popup: styles.lightbox }, confirmButtonColor: '#555b38', width: 'min(90vw, 960px)', showCloseButton: true, showConfirmButton: false })}>
    {label ? label : <img className={imageClass} src={src} alt={alt} onError={() => setFailedSource(src)} />}
  </button>;
}
