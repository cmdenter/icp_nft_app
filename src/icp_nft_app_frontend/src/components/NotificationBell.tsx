import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store/notificationStore';
import { BellIcon } from './icons';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const count = unreadCount();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const recent = notifications.slice(0, 20);

  function timeAgo(ts: number): string {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }

  const typeColor: Record<string, string> = {
    success: 'text-os-green',
    error: 'text-os-secondary',
    warning: 'text-os-yellow',
    info: 'text-os-primary',
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="w-10 h-10 rounded-full bg-os-surface border border-os-border flex items-center justify-center hover:border-os-primary/50 hover:ring-2 hover:ring-os-primary/20 transition-all duration-250 relative"
      >
        <BellIcon size={18} className="text-os-text-secondary" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-os-secondary text-white text-[11px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-[340px] bg-os-surface border border-os-border rounded-2xl shadow-2xl shadow-black/50 z-50 animate-float-in overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-os-border">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            {count > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-[11px] text-os-primary hover:text-os-primary-hover transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {recent.length === 0 ? (
              <div className="py-10 text-center">
                <BellIcon size={24} className="text-os-text-secondary/30 mx-auto mb-2" />
                <p className="text-sm text-os-text-secondary">No notifications yet</p>
              </div>
            ) : (
              recent.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { markRead(n.id); if (n.link) navigate(n.link); }}
                  className={`w-full text-left px-4 py-3 border-b border-os-border/30 hover:bg-os-card/50 transition-colors ${!n.read ? 'bg-os-primary/5' : ''}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`text-xs font-bold mt-0.5 ${typeColor[n.type] || 'text-os-primary'}`}>
                      {n.type === 'success' ? '\u2713' : n.type === 'error' ? '\u2717' : n.type === 'warning' ? '\u26A0' : '\u2139'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                      {n.message && <p className="text-[11px] text-os-text-secondary truncate mt-0.5">{n.message}</p>}
                      <p className="text-[11px] text-os-text-secondary/60 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-os-primary shrink-0 mt-1.5" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
