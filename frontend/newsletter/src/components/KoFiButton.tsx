'use client';

import styles from './KoFiButton.module.scss';

type Props = {
  kofiUrl: string;
  /** When true, pins the button to bottom-right of the viewport. */
  floating?: boolean;
};

export function KoFiButton({ kofiUrl, floating }: Props) {
  if (!kofiUrl) return null;
  return (
    <a
      href={kofiUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.kofi}${floating ? ` ${styles.floating}` : ''}`}
    >
      ☕ Support me on Ko-fi
    </a>
  );
}
