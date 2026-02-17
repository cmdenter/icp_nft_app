import React from 'react';
import { useNotificationStore } from '../store/notificationStore';
import type { Toast } from '../store/notificationStore';
import { XIcon } from './icons';

const typeStyles: Record<string, { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-os-green/10', border: 'border-os-green/30', icon: 'text-os-green' },
  error: { bg: 'bg-os-secondary/10', border: 'border-os-secondary/30', icon: 'text-os-secondary' },
  warning: { bg: 'bg-os-yellow/10', border: 'border-os-yellow/30', icon: 'text-os-yellow' },
  info: { bg: 'bg-os-primary/10', border: 'border-os-primary/30', icon: 'text-os-primary' },
};

const typeIcons: Record<string, string> = {
  success: '\u2713',
  error: '\u2717',
  warning: '\u26A0',
  info: '\u2139',
};

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const dismissToast = useNotificationStore((s) => s.dismissToast);
  const style = typeStyles[toast.type] || typeStyles.info;

  return (
    <div className={`${style.bg} border ${style.border} rounded-xl px-4 py-3 shadow-2xl shadow-black/40 flex items-start gap-3 min-w-[280px] max-w-[380px] animate-toast-in`}>
      <span className={`${style.icon} text-lg font-bold shrink-0 mt-0.5`}>{typeIcons[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.message && <p className="text-xs text-os-text-secondary mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={() => dismissToast(toast.id)} className="text-os-text-secondary hover:text-white shrink-0 mt-0.5">
        <XIcon size={14} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useNotificationStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2.5 pointer-events-auto" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
