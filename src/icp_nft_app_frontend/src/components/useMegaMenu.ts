import { useState, useRef, useCallback, useEffect } from 'react';

export function useMegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const enterTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const open = useCallback(() => {
    clearTimeout(leaveTimer.current);
    enterTimer.current = setTimeout(() => setIsOpen(true), 150);
  }, []);

  const close = useCallback(() => {
    clearTimeout(enterTimer.current);
    leaveTimer.current = setTimeout(() => setIsOpen(false), 300);
  }, []);

  const cancelClose = useCallback(() => {
    clearTimeout(leaveTimer.current);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((v) => !v);
  }, []);

  const forceClose = useCallback(() => {
    clearTimeout(enterTimer.current);
    clearTimeout(leaveTimer.current);
    setIsOpen(false);
  }, []);

  // ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') forceClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, forceClose]);

  // Cleanup
  useEffect(
    () => () => {
      clearTimeout(enterTimer.current);
      clearTimeout(leaveTimer.current);
    },
    [],
  );

  return { isOpen, open, close, cancelClose, toggle, forceClose };
}
