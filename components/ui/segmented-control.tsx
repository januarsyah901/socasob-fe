'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface SegmentedControlOption {
  value: string;
  label: React.ReactNode;
  href?: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange?: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps) {
  const id = React.useId();
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );

  const widthPercent = 100 / options.length;

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % options.length;
      focusAndSelect(nextIndex);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextIndex = (index - 1 + options.length) % options.length;
      focusAndSelect(nextIndex);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusAndSelect(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusAndSelect(options.length - 1);
    }
  }

  function focusAndSelect(index: number) {
    const el = document.getElementById(`seg-${id}-${index}`);
    el?.focus();
    if (!options[index].href && onChange) {
      onChange(options[index].value);
    }
  }

  function labelText(label: React.ReactNode): string {
    if (typeof label === 'string') return label;
    if (typeof label === 'number') return String(label);
    return '';
  }

  function handleMobileChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = options.find((o) => o.value === e.target.value);
    if (!selected) return;
    if (selected.href) {
      window.location.href = selected.href;
    } else if (onChange) {
      onChange(selected.value);
    }
  }

  const usesDropdownOnMobile = options.length > 2;

  const mobileSelect = usesDropdownOnMobile ? (
    <div className={cn('sm:hidden', className)}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={handleMobileChange}
        className="w-full rounded-full border border-sea-fog/60 dark:border-surface-2 bg-surface text-sm font-semibold text-signal-blue dark:text-white px-4 py-2 outline-none focus:ring-2 focus:ring-signal-blue cursor-pointer"
        style={{
          appearance: 'none',
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234e9ad9' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
          paddingRight: '40px',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {labelText(o.label)}
          </option>
        ))}
      </select>
    </div>
  ) : null;

  const pillControl = (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'relative flex rounded-full bg-transparent border border-sea-fog/60 dark:border-surface-2 p-1',
        usesDropdownOnMobile ? 'hidden sm:flex' : 'flex',
        !className?.split(' ').some((c) => c.startsWith('w-')) && 'w-64',
        className
      )}
    >
      <div
        className="absolute top-1 bottom-1 bg-surface dark:bg-surface-2 rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          width: `calc(${widthPercent}% - 6px)`,
          left: `calc(${selectedIndex * widthPercent}% + 3px)`,
        }}
      />
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const baseClasses = cn(
          'relative z-10 flex-1 flex items-center justify-center py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-signal-blue px-6',
          isSelected ? 'text-signal-blue dark:text-white' : 'text-text-muted hover:text-text'
        );

        if (option.href) {
          return (
            <Link
              key={option.value}
              id={`seg-${id}-${index}`}
              href={option.href}
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={baseClasses}
            >
              {option.label}
            </Link>
          );
        }

        return (
          <button
            key={option.value}
            id={`seg-${id}-${index}`}
            type="button"
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange?.(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={baseClasses}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {mobileSelect}
      {pillControl}
    </>
  );
}
