'use client';

import { useCallback, useRef } from 'react';

import styles from './GameEmbed.module.scss';

interface Props {
  gameUrl: string;
  gameType: 'iframe' | 'canvas' | 'link';
  title: string;
}

export function GameEmbed({ gameUrl, gameType, title }: Props) {
  const frameWrapRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    const el = frameWrapRef.current;
    if (!el) return;
    const doc = document;
    if (!doc.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      doc.exitFullscreen?.().catch(() => {});
    }
  }, []);

  if (gameType === 'link') {
    return (
      <a href={gameUrl} target="_blank" rel="noopener noreferrer" className={styles.gameLink}>
        🎮 Play {title}
      </a>
    );
  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameHeader}>
        <span className={styles.gameTitle}>🎮 {title}</span>
        <button type="button" className={styles.fullscreenBtn} onClick={toggleFullscreen}>
          ⛶ Fullscreen
        </button>
      </div>
      <div ref={frameWrapRef}>
        <iframe
          src={gameUrl}
          title={title}
          className={styles.gameFrame}
          sandbox="allow-scripts allow-same-origin allow-popups"
          allow="autoplay; fullscreen"
          loading="lazy"
        />
      </div>
    </div>
  );
}
