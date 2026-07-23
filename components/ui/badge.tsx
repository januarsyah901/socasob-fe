import { cn } from '@/lib/utils'

const badgeVariants = {
  default: 'bg-surface-2 text-text-muted border-border',
  primary: 'bg-signal-blue/10 text-signal-blue border-signal-blue/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-error/10 text-error border-error/20',
  active: 'bg-active-teal/10 text-active-teal border-active-teal/20',
}

interface BadgeProps {
  variant?: keyof typeof badgeVariants
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
