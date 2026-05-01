'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import styles from './AdSlot.module.scss';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

/** Load once via layout alongside AdSlot placeholders. */
export function AdSenseScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_ID;
  if (!client) return null;
  return (
    <Script
      id="adsense-lib"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

export function AdSlot({ slot, format = 'auto' }: { slot: string; format?: string }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!adsenseId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ads may refuse to load in development or blocked environments
    }
  }, [adsenseId, slot, format]);

  if (!adsenseId) return null;

  return (
    <aside className={styles.wrap} aria-label="Advertisement">
      <div className={styles.inner}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adsenseId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
