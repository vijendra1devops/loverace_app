import { useRef, useEffect, useState, useId } from 'react';

/**
 * HeartFill — liquid-fill heart showing bond level/stage progress.
 *
 * Props:
 *   level    {number}  1–101
 *   stage    {number}  1–4
 *   size     {number}  px diameter (default 64)
 *   animated {bool}    animate fill on mount (default true)
 *   pulse    {bool}    heartbeat pulse on container (default true)
 */

const STAGE_COLORS = {
  1: { fill: '#FF6B9D', wave: 'rgba(255,107,157,0.85)', bg: '#FFE4EC' },
  2: { fill: '#C0002A', wave: 'rgba(192,0,42,0.85)',   bg: '#FFAAB8' },
  3: { fill: '#8B0015', wave: 'rgba(139,0,21,0.85)',   bg: '#C0002A' },
  4: { fill: '#4A0008', wave: 'rgba(74,0,8,0.9)',      bg: '#8B0015' },
};

// Clamp fill percentage: level 1 = 1%, level 101 = 100%
function fillPct(level) {
  return Math.min(100, Math.max(1, level));
}

export default function HeartFill({ level = 1, stage = 1, size = 64, animated = true, pulse = true }) {
  const uid = useId().replace(/:/g, '');
  const clipId = `heart-clip-${uid}`;

  const colors = STAGE_COLORS[stage] ?? STAGE_COLORS[1];
  const pct = fillPct(level);

  // Animate fill height from 0 → pct on mount
  const [currentFill, setCurrentFill] = useState(animated ? 0 : pct);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!animated) { setCurrentFill(pct); return; }

    let start = null;
    const target = pct;
    const duration = 900; // ms

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrentFill(eased * target);
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [pct, animated]);

  const dim = size;
  const waveH = Math.round(dim * 0.18);  // wave height ≈ 18% of size
  const fillH = Math.round((currentFill / 100) * dim);

  return (
    <span
      className={pulse ? 'heart-fill-pulse' : undefined}
      style={{
        display: 'inline-block',
        width: dim,
        height: dim,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            {/* Heart shape matching the template */}
            <path d="M0.373,0.967 S0.616,0.866,0.768,0.644 S0.912,0.107,0.739,0 S0.373,0.108,0.373,0.108 S0.166,-0.113,0,-0.002 S-0.159,0.432,-0.021,0.644 S0.373,0.967,0.373,0.967" />
          </clipPath>
        </defs>
      </svg>

      {/* Heart shell — background colour shows unfilled portion */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: colors.bg,
          clipPath: `url(#${clipId})`,
          WebkitClipPath: `url(#${clipId})`,
          overflow: 'hidden',
        }}
      >
        {/* Liquid fill rising from bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: fillH + waveH,
            transition: animated ? undefined : 'none',
          }}
        >
          {/* Wave SVG scrolling horizontally */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${dim * 2} ${waveH}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '200%',
              height: waveH,
              animation: 'heartWaveMove 2.4s linear infinite',
            }}
            preserveAspectRatio="none"
          >
            <path
              d={`M0 ${waveH * 0.6}
                C${dim * 0.25} ${waveH * 0.0},
                  ${dim * 0.75} ${waveH * 1.2},
                  ${dim * 1.0} ${waveH * 0.6}
                C${dim * 1.25} ${waveH * 0.0},
                  ${dim * 1.75} ${waveH * 1.2},
                  ${dim * 2.0} ${waveH * 0.6}
                V${waveH} H0 Z`}
              fill={colors.wave}
            />
          </svg>
          {/* Solid fill block below the wave */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: fillH,
              background: colors.fill,
            }}
          />
        </div>
      </div>
    </span>
  );
}
