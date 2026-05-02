import type { ReactNode, CSSProperties } from 'react';
import { cx } from '../../utils';
import './Stack.css';

export type StackProps = {
  children: ReactNode;
  className?: string;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'column' | 'row';
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: boolean;
  as?: 'div' | 'section' | 'nav' | 'ul' | 'ol' | 'form';
};

export function Stack({
  children,
  className,
  gap = 'md',
  direction = 'column',
  align,
  justify,
  wrap,
  as: Tag = 'div',
}: StackProps) {
  const style: CSSProperties = {};
  if (align) style.alignItems = align;
  if (justify) style.justifyContent = justify;

  return (
    <Tag
      className={cx(
        'ds-stack',
        `ds-stack--${direction}`,
        `ds-stack--gap-${gap}`,
        wrap && 'ds-stack--wrap',
        className,
      )}
      style={Object.keys(style).length > 0 ? style : undefined}
    >
      {children}
    </Tag>
  );
}
