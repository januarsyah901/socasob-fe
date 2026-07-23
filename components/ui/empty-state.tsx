import { cn } from '@/lib/utils'
import { Button } from './button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  message?: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({ icon, title, message, action, className }: EmptyStateProps) {
  return (
    <div className={cn('card-sm p-10 flex flex-col items-center justify-center text-center gap-4', className)}>
      {icon && <div className="text-text-muted">{icon}</div>}
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      {message && <p className="text-sm text-text-muted max-w-xs">{message}</p>}
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
