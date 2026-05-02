import { forwardRef } from 'react';
import { cx } from '../../utils';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cx('ds-btn', `ds-btn--${variant}`, `ds-btn--${size}`, className)}
        {...props}
      />
    );
  },
);
