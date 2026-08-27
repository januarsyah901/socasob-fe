import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  /** Ikon Lucide component atau elemen kustom */
  icon?: LucideIcon | React.ReactNode;
  /** Judul utama pesan kosong */
  title: string;
  /** Penjelasan detail atau saran tindakan */
  description?: React.ReactNode;
  /** Alias untuk description */
  message?: React.ReactNode;
  /** Tombol aksi opsional (misal: tombol tambah / buat baru) */
  action?: React.ReactNode;
  /** Variasi gaya wadah */
  variant?: 'default' | 'card' | 'dashed' | 'plain';
  /** Ukuran ringkas untuk area kecil seperti sidebar / dropdown */
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  message,
  action,
  variant = 'default',
  compact = false,
  className,
}: EmptyStateProps) {
  const desc = description ?? message;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComp = icon as LucideIcon;
    return <IconComp className={cn(compact ? 'size-4.5' : 'size-6', 'text-text-muted/70')} />;
  };

  const hasIcon = Boolean(icon);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-5 px-3' : 'py-8 px-4 md:py-10',
        variant === 'card' && 'card',
        variant === 'dashed' && 'border border-dashed border-border/80 rounded-2xl bg-transparent',
        className
      )}
    >
      {hasIcon && (
        <div
          className={cn(
            'mb-3 rounded-2xl bg-surface-2/60 border border-border/40 flex items-center justify-center text-text-muted',
            compact ? 'size-8.5' : 'size-11 md:size-12'
          )}
          aria-hidden
        >
          {renderIcon()}
        </div>
      )}
      <h3 className={cn('font-semibold text-text', compact ? 'text-xs' : 'text-sm md:text-base')}>
        {title}
      </h3>
      {desc && (
        <div
          className={cn(
            'mt-1 text-text-muted max-w-sm leading-relaxed',
            compact ? 'text-[11px]' : 'text-xs md:text-sm'
          )}
        >
          {desc}
        </div>
      )}
      {action && <div className={cn(compact ? 'mt-3' : 'mt-4')}>{action}</div>}
    </div>
  );
}
