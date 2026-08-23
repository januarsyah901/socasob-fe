import { Eye } from 'lucide-react';

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="mb-4 rounded-full bg-surface-2 p-4 text-text-muted" aria-hidden>
        {icon ?? <Eye className="size-8" />}
      </div>
      <h3 className="font-semibold text-text">{title}</h3>
      <p className="mt-1.5 text-sm text-text-muted max-w-sm">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
