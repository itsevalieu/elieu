import type { ReactNode } from 'react';
import { cx } from '../../utils';
import './Container.css';

export type ContainerProps = {
  children: ReactNode;
  className?: string;
  size?: 'prose' | 'content' | 'wide';
  as?: 'div' | 'main' | 'section' | 'article';
};

export function Container({
  children,
  className,
  size = 'content',
  as: Tag = 'div',
}: ContainerProps) {
  return (
    <Tag className={cx('ds-container', `ds-container--${size}`, className)}>
      {children}
    </Tag>
  );
}
