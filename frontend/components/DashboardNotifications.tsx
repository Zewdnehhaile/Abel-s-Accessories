import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Bell, Package, Wrench } from 'lucide-react';
import { DashboardNotificationItem } from '../utils/dashboardNotifications';

const toneStyles = {
  sky: {
    ring: 'border-sky-500/20',
    accent: 'bg-sky-500/10 text-sky-400',
    value: 'text-sky-500'
  },
  emerald: {
    ring: 'border-emerald-500/20',
    accent: 'bg-emerald-500/10 text-emerald-400',
    value: 'text-emerald-500'
  },
  amber: {
    ring: 'border-amber-500/20',
    accent: 'bg-amber-500/10 text-amber-400',
    value: 'text-amber-500'
  }
} as const;

const typeIcons: Record<DashboardNotificationItem['id'], ReactNode> = {
  repair: <Wrench size={20} />,
  sales: <Package size={20} />,
  stock: <AlertTriangle size={20} />
};

type DashboardNotificationsProps = {
  items: DashboardNotificationItem[];
  variant?: 'light' | 'dark';
  className?: string;
  buttonLabel?: string;
  onItemClick?: (item: DashboardNotificationItem) => void;
};

const DashboardNotifications: React.FC<DashboardNotificationsProps> = ({
  items,
  variant = 'light',
  className = '',
  buttonLabel = 'Notifications',
  onItemClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [readSignatures, setReadSignatures] = useState<Record<string, string>>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const storageKey = `dashboard-notifications:${buttonLabel}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, string>;
        if (parsed && typeof parsed === 'object') {
          setReadSignatures(parsed);
        }
      }
    } catch {
      // ignore storage issues
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(readSignatures));
    } catch {
      // ignore storage issues
    }
  }, [readSignatures, storageKey]);

  const itemSignature = (item: DashboardNotificationItem) => `${item.value}|${item.description}`;
  const unreadCount = useMemo(
    () => items.filter(item => readSignatures[item.id] !== itemSignature(item)).length,
    [items, readSignatures]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const panelClassName =
    variant === 'dark'
      ? 'bg-dark-900 border-dark-700 shadow-2xl'
      : 'bg-[var(--bg-card)] border-[var(--border)] shadow-2xl';

  const textMutedClassName =
    variant === 'dark' ? 'text-gray-400' : 'text-[var(--text-muted)]';

  const badgeClassName =
    variant === 'dark'
      ? 'bg-red-500 text-white'
      : 'bg-red-500 text-white';

  return (
    <div ref={wrapperRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={buttonLabel}
        aria-expanded={isOpen}
        className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
          variant === 'dark'
            ? 'bg-dark-800 border-dark-700 text-white hover:bg-dark-700'
            : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--bg-body)]'
        }`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={`absolute -right-1 -top-1 min-w-5 px-1.5 h-5 rounded-full text-[11px] font-black leading-5 text-center ${badgeClassName}`}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-full z-50 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border ${panelClassName}`}
        >
          <div className={`flex items-start justify-between gap-4 border-b ${variant === 'dark' ? 'border-dark-700' : 'border-[var(--border)]'} px-5 py-4`}>
            <div>
              <p className={`text-[11px] font-black uppercase tracking-[0.35em] ${textMutedClassName}`}>
                Notifications
              </p>
              <h2 className="text-lg font-black tracking-tight">Live alerts</h2>
            </div>
              <div className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.25em] ${textMutedClassName} ${variant === 'dark' ? 'bg-white/5' : 'bg-[var(--bg-body)]'}`}>
              {unreadCount} unread
            </div>
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {items.length > 0 ? (
              items.map(item => {
                const style = toneStyles[item.tone];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setReadSignatures(prev => ({ ...prev, [item.id]: itemSignature(item) }));
                      setIsOpen(false);
                      onItemClick?.(item);
                    }}
                    className={`w-full text-left flex gap-3 px-5 py-4 ${variant === 'dark' ? 'hover:bg-white/5' : 'hover:bg-[var(--bg-body)]'} transition-colors`}
                  >
                    <div className={`mt-0.5 w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center ${style.accent}`}>
                      {typeIcons[item.id]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black tracking-tight">{item.title}</p>
                        <span className={`text-sm font-black ${style.value}`}>{item.value}</span>
                      </div>
                      <p className={`mt-1 text-sm leading-relaxed ${textMutedClassName}`}>{item.description}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className={`px-5 py-10 text-center ${textMutedClassName}`}>
                No alerts right now.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardNotifications;
