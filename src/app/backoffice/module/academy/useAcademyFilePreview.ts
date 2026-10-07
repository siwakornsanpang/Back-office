"use client";
import { useEffect, useState } from "react";

export default function useAcademyFilePreview(file: File | null) {
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    let active = true;
    // Publish only while this file still owns the URL; cleanup also handles unmounts.
    queueMicrotask(() => { if (active) setPreview({ file, url }); });
    return () => { active = false; URL.revokeObjectURL(url); };
  }, [file]);
  return preview?.file === file ? preview.url : "";
}
