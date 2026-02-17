import React, { useState, useEffect, useRef, useCallback } from 'react';

/** Multi-URL image — tries each URL in sequence, shows gradient placeholder when all fail */
export function SafeImg({ urls, src, alt = '', fallback, className = '', onAllFailed, ...rest }:
  React.ImgHTMLAttributes<HTMLImageElement> & { fallback: string; urls?: string[]; onAllFailed?: () => void }) {
  const allUrls = urls || (src ? [src] : []);
  const [idx, setIdx] = useState(0);
  const current = idx < allUrls.length ? allUrls[idx] : '';
  const calledRef = useRef(false);

  // Reset index when urls change
  useEffect(() => {
    setIdx(0);
    calledRef.current = false;
  }, [urls, src]);

  useEffect(() => {
    if (!current && idx > 0 && onAllFailed && !calledRef.current) {
      calledRef.current = true;
      onAllFailed();
    }
  }, [current, idx, onAllFailed]);

  const advance = useCallback(() => setIdx((i) => i + 1), []);

  // After image loads, verify it actually rendered (catches text/plain responses
  // that don't fire onerror but produce a 0x0 image)
  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      advance();
    }
  }, [advance]);

  if (!current) {
    return (
      <div
        className={className}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #15253B 0%, #1C3150 50%, rgba(32,129,226,0.12) 100%)',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 700, fontSize: '1.1rem', userSelect: 'none' }}>
          {fallback}
        </span>
      </div>
    );
  }
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      onError={advance}
      onLoad={handleLoad}
      {...rest}
    />
  );
}
