'use client';

import { cn } from '@/lib/utils';
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface FieldWrapProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  id: string;
  children: React.ReactNode;
}

function FieldWrap({ label, error, hint, required, id, children }: FieldWrapProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text">
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, required, className, id: idProp, ...props }: InputProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <FieldWrap label={label} error={error} hint={hint} required={required} id={id}>
      <input
        id={id}
        required={required}
        aria-invalid={!!error}
        className={cn('input-base', error && 'border-red-400', className)}
        {...props}
      />
    </FieldWrap>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, required, className, id: idProp, ...props }: TextareaProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <FieldWrap label={label} error={error} hint={hint} required={required} id={id}>
      <textarea
        id={id}
        required={required}
        aria-invalid={!!error}
        className={cn('input-base min-h-28 resize-y', error && 'border-red-400', className)}
        {...props}
      />
    </FieldWrap>
  );
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
}

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

function toText(content: ReactNode): string {
  return Children.toArray(content)
    .map((node) => {
      if (typeof node === 'string' || typeof node === 'number') return String(node);
      return '';
    })
    .join('')
    .trim();
}

function toOption(child: ReactNode): SelectOption | null {
  if (!isValidElement(child)) return null;
  const element = child as ReactElement<{ value?: string; children?: ReactNode; disabled?: boolean }>;
  if (element.type !== 'option') return null;
  return {
    value: String(element.props.value ?? ''),
    label: toText(element.props.children),
    disabled: !!element.props.disabled,
  };
}

export function Select({
  label,
  error,
  hint,
  required,
  className,
  id: idProp,
  children,
  name,
  value,
  defaultValue,
  onChange,
  disabled,
  placeholder,
  ...props
}: SelectProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const options = useMemo(() => Children.toArray(children).map(toOption).filter(Boolean) as SelectOption[], [children]);
  const controlledValue = value !== undefined ? String(value) : undefined;
  const derivedInitialValue = controlledValue ?? (defaultValue !== undefined ? String(defaultValue) : options[0]?.value ?? '');
  const [internalValue, setInternalValue] = useState(derivedInitialValue);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hiddenSelectRef = useRef<HTMLSelectElement | null>(null);
  const currentValue = controlledValue ?? internalValue;
  const selected = options.find((option) => option.value === currentValue);

  useEffect(() => {
    if (controlledValue !== undefined) return;
    setInternalValue(derivedInitialValue);
  }, [controlledValue, derivedInitialValue]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onEscape);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  function choose(nextValue: string) {
    if (controlledValue === undefined) setInternalValue(nextValue);
    setOpen(false);
    if (hiddenSelectRef.current) {
      hiddenSelectRef.current.value = nextValue;
      onChange?.({
        target: hiddenSelectRef.current,
        currentTarget: hiddenSelectRef.current,
      } as React.ChangeEvent<HTMLSelectElement>);
    }
  }

  return (
    <FieldWrap label={label} error={error} hint={hint} required={required} id={id}>
      <div ref={rootRef} className="relative">
        <select
          {...props}
          ref={hiddenSelectRef}
          id={id}
          name={name}
          value={currentValue}
          required={required}
          disabled={disabled}
          onChange={() => {}}
          tabIndex={-1}
          aria-hidden
          className="sr-only"
        >
          {Children.map(children, (child) => (isValidElement(child) ? cloneElement(child) : child))}
        </select>
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            'input-base flex items-center justify-between gap-3 text-left cursor-pointer',
            disabled && 'cursor-not-allowed opacity-60',
            error && 'border-red-400',
            className
          )}
        >
          <span className={cn('truncate', !selected && 'text-text-muted')}>{selected?.label ?? placeholder ?? 'Pilih opsi'}</span>
          <ChevronDown className={cn('size-4 shrink-0 text-text-muted transition-transform', open && 'rotate-180')} />
        </button>
        {open && !disabled && (
          <div
            id={`${id}-listbox`}
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-40 overflow-hidden rounded-[24px] border border-border bg-surface p-2 shadow-[0_20px_50px_rgba(11,54,88,0.16)]"
          >
            <div className="max-h-72 overflow-y-auto">
              {options.map((option) => {
                const active = option.value === currentValue;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    disabled={option.disabled}
                    onClick={() => choose(option.value)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm text-left transition-colors',
                      active ? 'bg-ice-tint text-signal-blue dark:bg-surface-2 dark:text-white' : 'text-text hover:bg-surface-2',
                      option.disabled && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    <Check className={cn('size-4 shrink-0', active ? 'opacity-100' : 'opacity-0')} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </FieldWrap>
  );
}
