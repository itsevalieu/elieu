import type { ReactNode } from 'react';
import { cx } from '../../utils';
import './Card.css';

export type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
  bordered?: boolean;
  as?: 'div' | 'article' | 'section';
};

export function Card({
  children,
  className,
  padding = 'md',
  elevated = false,
  bordered = true,
  as: Tag = 'div',
}: CardProps) {
  return (
    <Tag
      className={cx(
        'ds-card',
        `ds-card--pad-${padding}`,
        elevated && 'ds-card--elevated',
        bordered && 'ds-card--bordered',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
