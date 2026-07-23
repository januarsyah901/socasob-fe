'use client'

import { cn } from '@/lib/utils'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('inline-flex bg-surface-2 rounded-3xl p-1 gap-0.5', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3.5 py-1.5 text-sm font-medium rounded-2xl transition-all',
            value === opt.value
              ? 'bg-surface text-text shadow-dreamy'
              : 'text-text-muted hover:text-text'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
