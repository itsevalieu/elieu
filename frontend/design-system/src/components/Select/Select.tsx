import { forwardRef } from 'react';
import { cx } from '../../utils';
import '../Input/Input.css';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, id, label, error, required, children, ...props }, ref) {
    const inputId = id ?? props.name ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="ds-field">
        {label && (
          <label htmlFor={inputId} className="ds-field__label">
            {label}
            {required && <span className="ds-field__required"> *</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          required={required}
          className={cx('ds-input', error && 'ds-input--error', className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p id={`${inputId}-error`} className="ds-field__error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
