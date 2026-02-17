import React, { useState, useEffect, useRef } from 'react';

/** Multi-URL image — tries each URL in sequence, shows gradient placeholder when all fail */
export function SafeImg({ urls, src, alt = '', fallback, className = '', onAllFailed, ...rest }:
  React.ImgHTMLAttributes<HTMLImageElement> & { fallback: string; urls?: string[]; onAllFailed?: () => void }) {
  const allUrls = urls || (src ? [src] : []);
  const [idx, setIdx] = useState(0);
  const current = idx < allUrls.length ? allUrls[idx] : '';
  const calledRef = useRef(false);

  useEffect(() => {
    if (!current && idx > 0 && onAllFailed && !calledRef.current) {
      calledRef.current = true;
      onAllFailed();
    }
  }, [current, idx, onAllFailed]);

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
  return <img src={current} alt={alt} className={className} onError={() => setIdx((i) => i + 1)} {...rest} />;
}
