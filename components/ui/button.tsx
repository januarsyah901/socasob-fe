import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-signal-blue text-white hover:bg-signal-blue/90 active:bg-signal-blue/85 shadow-sm hover:shadow-md disabled:bg-light-mist disabled:text-slate-channel',
  secondary:
    'bg-transparent border border-sea-fog text-midnight-harbor hover:bg-ice-tint hover:border-sea-fog dark:border-slate-channel dark:text-slate-channel dark:hover:bg-surface-2 dark:hover:text-white dark:hover:border-slate-channel font-semibold',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 disabled:bg-rose-300',
  ghost:
    'text-midnight-harbor hover:bg-ice-tint dark:text-slate-channel dark:hover:bg-surface-2 dark:hover:text-white font-semibold',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-xs rounded-full gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-full gap-2',
  lg: 'px-6 py-3 text-base rounded-full gap-2',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
