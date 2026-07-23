import { cn } from '@/lib/utils'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ eyebrow, title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-4', className)}>
      <div className="space-y-1.5">
        {eyebrow && (
          <span className="text-xs font-semibold text-signal-blue uppercase tracking-widest">
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-text tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-text-muted max-w-xl">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
