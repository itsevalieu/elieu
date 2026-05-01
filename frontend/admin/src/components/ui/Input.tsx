'use client';

import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, id, label, error, required, ...props },
  ref,
) {
  const inputId = id ?? props.name ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-zinc-800">
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        required={required}
        className={cn(
          'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
