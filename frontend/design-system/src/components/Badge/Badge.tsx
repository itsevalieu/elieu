import { cx } from '../../utils';
import './Badge.css';

export type BadgeTone = 'neutral' | 'green' | 'blue' | 'yellow' | 'red';

export type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
};

const AUTO_TONES: Record<string, BadgeTone> = {
  published: 'green',
  approved: 'green',
  confirmed: 'green',
  scheduled: 'blue',
  draft: 'yellow',
  pending: 'yellow',
  archived: 'red',
  rejected: 'red',
  unsubscribed: 'red',
};

export function Badge({ children, tone, className }: BadgeProps) {
  const resolved = tone ?? AUTO_TONES[String(children).trim().toLowerCase()] ?? 'neutral';
  return (
    <span className={cx('ds-badge', `ds-badge--${resolved}`, className)}>
      {children}
    </span>
  );
}
