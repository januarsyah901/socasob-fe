'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useEffect, useRef, useId, useState } from 'react';
import { createPortal } from 'react-dom';

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const focusable = dialog?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === dialog) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener('keydown', onKey, true);
    dialog?.addEventListener('keydown', trapFocus);
    document.body.style.overflow = 'hidden';
    dialog?.focus();

    return () => {
      document.removeEventListener('keydown', onKey, true);
      dialog?.removeEventListener('keydown', trapFocus);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 w-screen h-screen overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-midnight-harbor/60 backdrop-blur-md animate-fade-in cursor-pointer"
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        ref={ref}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative card w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 animate-fade-up rounded-[24px] focus:outline-none z-10 shadow-2xl border border-border/80 my-auto',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 id={titleId} className="text-lg font-semibold text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="rounded-xl p-1.5 text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-signal-blue"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
