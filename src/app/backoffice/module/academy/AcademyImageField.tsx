'use client';

import { useId, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Crop, Trash2, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import getCroppedImg from '@/app/components/editor/cropImage';
import AcademyModal from './AcademyModal';
import AcademyImagePreview from './AcademyImagePreview';
import useAcademyFilePreview from './useAcademyFilePreview';
import styles from './AcademyFields.module.css';

export default function AcademyImageField({ label, src, file, onFileChange, onRemove, cover = false, disabled = false }: { label: string; src?: string | null; file: File | null; onFileChange: (file: File | null) => void; onRemove: () => void; cover?: boolean; disabled?: boolean }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const chooseButton = useRef<HTMLButtonElement>(null);
  const preview = useAcademyFilePreview(file);
  const image = preview || src;
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const draftPreview = useAcademyFilePreview(draftFile);
  const [editing, setEditing] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const busyRef = useRef(false);
  const cropSource = draftFile ? draftPreview : image;
  const closeCrop = () => { setEditing(false); setDraftFile(null); setError(''); };
  const startCrop = (selected: File | null) => {
    setDraftFile(selected); setCrop({ x: 0, y: 0 }); setZoom(1); setArea(null); setError(''); setEditing(true);
  };
  const confirmCrop = async () => {
    if (!cropSource || !area || busyRef.current) return;
    busyRef.current = true; setBusy(true); setError('');
    try {
      const name = (draftFile?.name || file?.name || 'academy-image').replace(/\.[^.]+$/, '');
      const cropped = await getCroppedImg(cropSource, area, `${name}.png`);
      if (!cropped) throw new Error();
      onFileChange(cropped); closeCrop();
    } catch {
      setError('ครอปรูปไม่สำเร็จ ลองอีกครั้งหรือเลือกรูปจากเครื่องใหม่');
    } finally { busyRef.current = false; setBusy(false); }
  };
  return <div className={styles.imageField} role="group" aria-labelledby={`${id}-label`}>
    <span id={`${id}-label`} className={styles.label}>{label}</span>
    <div className={styles.imageBody}>
      <AcademyImagePreview src={image} alt={label} cover={cover} className={`${styles.largePreview} ${cover ? styles.coverPreview : ''}`} />
      <div className={styles.imageActions}>
        <button ref={chooseButton} type="button" className={styles.chooseButton} disabled={disabled} onClick={() => input.current?.click()}><Upload size={16} aria-hidden="true" />{image || file ? 'เปลี่ยนรูป' : 'เลือกรูป'}</button>
        {!!image && <>
          <button type="button" className={styles.chooseButton} disabled={disabled} onClick={() => startCrop(null)}><Crop size={16} aria-hidden="true" />ครอปรูป</button>
          <button type="button" className={`${styles.chooseButton} ${styles.removeButton}`} disabled={disabled} onClick={() => { onRemove(); requestAnimationFrame(() => chooseButton.current?.focus()); }}><Trash2 size={16} aria-hidden="true" />ลบรูป</button>
        </>}
      </div>
      <input ref={input} id={id} type="file" accept="image/*" hidden disabled={disabled} aria-label={label} onChange={(event) => { const selected = event.target.files?.[0]; if (selected) startCrop(selected); event.target.value = ''; }} />
      <span className={styles.fileName}>{file ? file.name : image ? 'กดที่รูปเพื่อดูรูปเต็ม' : 'ยังไม่ได้เลือกรูป'}</span>
    </div>
    <AcademyModal open={editing} title={`ปรับ${label}`} titleId={`${id}-crop-title`} saving={busy} onClose={closeCrop}>
      <div className={styles.cropBody}>
        <p className={styles.cropHint}>ลากรูปเพื่อเลือกตำแหน่ง และปรับขนาดด้วยแถบซูม</p>
        <div className={styles.cropStage}>
          {cropSource && <Cropper image={cropSource} crop={crop} zoom={zoom} aspect={cover ? 16 / 9 : 1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setArea(pixels)} onMediaLoaded={() => setError('')} mediaProps={{ onError: () => { setArea(null); setError('โหลดรูปไม่สำเร็จ กรุณาเลือกรูปจากเครื่องใหม่'); } }} />}
        </div>
        <label className={styles.zoomLabel} htmlFor={`${id}-zoom`}>ขยายรูป</label>
        <div className={styles.zoomControl}>
          <ZoomOut size={18} aria-hidden="true" />
          <input id={`${id}-zoom`} type="range" min="1" max="3" step="0.05" value={zoom} disabled={busy} onChange={(event) => setZoom(Number(event.target.value))} />
          <ZoomIn size={18} aria-hidden="true" />
        </div>
        {error && <p role="alert" className={styles.cropError}>{error}</p>}
        <div className={styles.cropActions}>
          <button type="button" className={styles.chooseButton} disabled={busy} onClick={closeCrop}>ยกเลิก</button>
          <button type="button" className={styles.confirmCrop} disabled={busy || !area} onClick={confirmCrop}>{busy ? 'กำลังปรับรูป...' : 'ใช้รูปนี้'}</button>
        </div>
      </div>
    </AcademyModal>
  </div>;
}
