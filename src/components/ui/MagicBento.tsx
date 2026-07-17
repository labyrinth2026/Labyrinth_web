import React, { useRef, useState, useCallback, useEffect } from 'react';
import './MagicBento.css';

interface BentoItem {
  id: string | number;
  title: string;
  description?: string;
  category?: string;
  image?: string;
  date?: string;
  rotation?: number;
  orientation?: 'landscape' | 'portrait' | string;
}

interface MagicBentoProps {
  items: BentoItem[];
  onItemClick?: (item: BentoItem) => void;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  glowColor?: string; // CSS RGB triple, e.g. "205, 0, 0"
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

const MagicBentoCard: React.FC<{
  item: BentoItem;
  onItemClick?: (item: BentoItem) => void;
  enableStars: boolean;
  enableSpotlight: boolean;
  enableBorderGlow: boolean;
  enableTilt: boolean;
  enableMagnetism: boolean;
  clickEffect: boolean;
  glowColor: string;
}> = ({
  item,
  onItemClick,
  enableStars,
  enableSpotlight,
  enableBorderGlow,
  enableTilt,
  enableMagnetism,
  clickEffect,
  glowColor,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState<Star[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const starIdRef = useRef(0);
  const rippleIdRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const isLandscape = item.orientation === 'landscape';

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const xPct = (cx / rect.width) * 100;
      const yPct = (cy / rect.height) * 100;

      // Spotlight
      if (enableSpotlight) {
        setSpotlight({ x: xPct, y: yPct, opacity: 1 });
      }

      // Tilt
      if (enableTilt) {
        const xRot = ((cy / rect.height) - 0.5) * -12;
        const yRot = ((cx / rect.width) - 0.5) * 12;
        setTilt({ x: xRot, y: yRot });
      }

      // Magnetism
      if (enableMagnetism) {
        const mx = ((cx / rect.width) - 0.5) * 8;
        const my = ((cy / rect.height) - 0.5) * 8;
        setTranslate({ x: mx, y: my });
      }

      // Stars
      if (enableStars) {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(() => {
          if (Math.random() > 0.7) {
            const id = starIdRef.current++;
            const star: Star = {
              id,
              x: cx + (Math.random() - 0.5) * 30,
              y: cy + (Math.random() - 0.5) * 30,
              size: Math.random() * 3 + 1.5,
              duration: Math.random() * 0.6 + 0.4,
            };
            setStars(prev => [...prev.slice(-12), star]);
          }
        });
      }
    },
    [enableSpotlight, enableTilt, enableMagnetism, enableStars]
  );

  const handleMouseLeave = useCallback(() => {
    setSpotlight(s => ({ ...s, opacity: 0 }));
    setTilt({ x: 0, y: 0 });
    setTranslate({ x: 0, y: 0 });
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (clickEffect) {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height);
        const id = rippleIdRef.current++;
        setRipples(prev => [...prev, { id, x: x - size / 2, y: y - size / 2, size }]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
      }
      onItemClick?.(item);
    },
    [clickEffect, item, onItemClick]
  );

  // Remove old stars
  useEffect(() => {
    if (stars.length === 0) return;
    const oldest = stars[0];
    const timer = setTimeout(() => {
      setStars(prev => prev.filter(s => s.id !== oldest.id));
    }, (oldest.duration + 0.1) * 1000);
    return () => clearTimeout(timer);
  }, [stars]);

  const cardStyle: React.CSSProperties = {
    '--glow-color': glowColor,
    transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translate(${translate.x}px, ${translate.y}px)`,
    transition: tilt.x === 0 && tilt.y === 0
      ? 'transform 0.35s ease, box-shadow 0.3s ease, border-color 0.3s ease'
      : 'transform 0.08s ease, box-shadow 0.3s ease, border-color 0.3s ease',
  } as React.CSSProperties;

  return (
    <div
      ref={cardRef}
      className={[
        'magic-bento-card',
        isLandscape ? 'landscape' : '',
        enableBorderGlow ? 'border-glow' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onItemClick?.(item)}
      aria-label={item.title}
    >
      {/* Background image */}
      {item.image && (
        <img
          src={item.image}
          alt={item.title}
          className="magic-bento-img"
          loading="lazy"
          draggable={false}
        />
      )}

      {/* Gradient overlay */}
      <div className="magic-bento-overlay" />

      {/* Spotlight */}
      {enableSpotlight && (
        <div
          className="magic-bento-spotlight"
          style={{
            background: `radial-gradient(350px circle at ${spotlight.x}% ${spotlight.y}%, rgba(${glowColor}, 0.18) 0%, transparent 70%)`,
            opacity: spotlight.opacity,
          }}
        />
      )}

      {/* Stars */}
      {enableStars &&
        stars.map(star => (
          <div
            key={star.id}
            className="magic-bento-star"
            style={{
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              '--duration': `${star.duration}s`,
            } as React.CSSProperties}
          />
        ))}

      {/* Ripples */}
      {clickEffect &&
        ripples.map(r => (
          <span
            key={r.id}
            className="magic-bento-ripple"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
          />
        ))}

      {/* Zoom icon */}
      <div className="magic-bento-zoom">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>

      {/* Card content */}
      <div className="magic-bento-content">
        {item.category && (
          <span className="magic-bento-category">{item.category}</span>
        )}
      </div>
    </div>
  );
};

const MagicBento: React.FC<MagicBentoProps> = ({
  items,
  onItemClick,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = false,
  clickEffect = true,
  glowColor = '205, 0, 0',
}) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '3rem 0' }}>
        No items to display.
      </div>
    );
  }

  return (
    <div className="magic-bento-grid">
      {items.map(item => (
        <MagicBentoCard
          key={item.id}
          item={item}
          onItemClick={onItemClick}
          enableStars={enableStars}
          enableSpotlight={enableSpotlight}
          enableBorderGlow={enableBorderGlow}
          enableTilt={enableTilt}
          enableMagnetism={enableMagnetism}
          clickEffect={clickEffect}
          glowColor={glowColor}
        />
      ))}
    </div>
  );
};

export default MagicBento;
