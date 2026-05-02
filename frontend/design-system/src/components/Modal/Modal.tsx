'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils';
import { Button } from '../Button';
import './Modal.css';

export type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Modal({ open, title, onClose, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="ds-modal-overlay">
      <button
        type="button"
        className="ds-modal-backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ds-modal-title"
        className={cx('ds-modal', className)}
      >
        <div className="ds-modal__header">
          <h2 id="ds-modal-title" className="ds-modal__title">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            &#x2715;
          </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
