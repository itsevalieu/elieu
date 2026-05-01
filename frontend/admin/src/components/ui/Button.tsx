'use client';

import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

const variantCls: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'border-transparent bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm disabled:bg-zinc-400',
  secondary:
    'border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 shadow-sm disabled:opacity-50',
  danger: 'border-transparent bg-red-600 text-white hover:bg-red-500 shadow-sm disabled:bg-red-300',
};

const sizeCls: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-2.5 py-1 text-xs rounded-md',
  md: 'px-3.5 py-2 text-sm rounded-lg',
  lg: 'px-4 py-2.5 text-base rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-colors disabled:cursor-not-allowed',
        variantCls[variant],
        sizeCls[size],
        className,
      )}
      {...props}
    />
  );
});
