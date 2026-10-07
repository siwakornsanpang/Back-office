'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { academyConfirmDiscard } from './academyFeedback';

type AcademyNavigation = EventTarget & { traverseTo: (key: string) => unknown };
type AcademyNavigateEvent = Event & { navigationType?: string; destination?: { key: string } };

export default function useAcademyUnsavedChanges(dirty: boolean, saving = false) {
  const router = useRouter();
  const dirtyRef = useRef(dirty);
  const savingRef = useRef(saving);
  const promptRef = useRef<Promise<boolean> | null>(null);
  useLayoutEffect(() => { dirtyRef.current = dirty; savingRef.current = saving; }, [dirty, saving]);
  const confirmDiscard = useCallback(async () => {
    if (savingRef.current) return false;
    if (!dirtyRef.current) return true;
    if (!promptRef.current) promptRef.current = academyConfirmDiscard().then(result => Boolean(result.isConfirmed)).finally(() => { promptRef.current = null; });
    return promptRef.current;
  }, []);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault(); event.returnValue = '';
    };
    const click = (event: MouseEvent) => {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element)?.closest('a[href]') as HTMLAnchorElement | null;
      if (!link || link.target === '_blank' || link.hasAttribute('download') || link.getAttribute('href')?.startsWith('#') || link.href === location.href) return;
      event.preventDefault(); event.stopPropagation();
      const url = new URL(link.href);
      void confirmDiscard().then(confirmed => {
        if (!confirmed) return;
        dirtyRef.current = false;
        if (url.origin === location.origin) router.push(url.pathname + url.search + url.hash);
        else location.assign(url.href);
      });
    };
    // Chromium cancels Back/Forward before Next changes the page.
    const navigation = (window as unknown as { navigation?: AcademyNavigation }).navigation;
    let allowTraverse = false;
    const traverse = (event: Event) => {
      const next = event as AcademyNavigateEvent;
      if (allowTraverse) { allowTraverse = false; return; }
      if (next.navigationType !== 'traverse' || !event.cancelable || !dirtyRef.current || !next.destination) return;
      event.preventDefault();
      const key = next.destination.key;
      void confirmDiscard().then(confirmed => {
        if (!confirmed) return;
        dirtyRef.current = false; allowTraverse = true; navigation?.traverseTo(key);
      });
    };
    let restoring = false;
    const popstate = (event: PopStateEvent) => {
      if (restoring) { restoring = false; event.stopImmediatePropagation(); return; }
      if (allowTraverse) { allowTraverse = false; return; }
      if (!dirtyRef.current) return;
      event.stopImmediatePropagation(); restoring = true; history.go(1);
      void confirmDiscard().then(confirmed => {
        if (confirmed) { dirtyRef.current = false; allowTraverse = true; history.back(); }
      });
    };
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', click, true);
    navigation?.addEventListener('navigate', traverse);
    if (!navigation) window.addEventListener('popstate', popstate, true);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('click', click, true);
      navigation?.removeEventListener('navigate', traverse);
      window.removeEventListener('popstate', popstate, true);
    };
  }, [confirmDiscard, router]);
  return confirmDiscard;
}
