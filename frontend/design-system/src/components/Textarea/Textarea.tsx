import { forwardRef } from 'react';
import { cx } from '../../utils';
import '../Input/Input.css';
import './Textarea.css';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, id, label, error, required, ...props }, ref) {
    const inputId = id ?? props.name ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="ds-field">
        {label && (
          <label htmlFor={inputId} className="ds-field__label">
            {label}
            {required && <span className="ds-field__required"> *</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          required={required}
          className={cx('ds-input', 'ds-textarea', error && 'ds-input--error', className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="ds-field__error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
