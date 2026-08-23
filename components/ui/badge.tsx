import { cn } from '@/lib/utils';

export function Badge({
  children,
  color,
  className,
  title,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        !color && 'bg-surface-2 text-text dark:text-slate-300',
        className
      )}
      style={
        color
          ? { backgroundColor: `${color}22`, color: color, border: `1px solid ${color}44` }
          : undefined
      }
    >
      {children}
    </span>
  );
}

export function EmotionDot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-2 rounded-full', className)}
      style={{ backgroundColor: color }}
    />
  );
}
