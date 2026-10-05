import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface FloatingHeartParticle {
  id: number;
  x: number; // percentage (0 - 100)
  size: number; // in px (14 - 32)
  duration: number; // in seconds (12 - 24)
  delay: number; // in seconds
  swayAmount: number; // in px
  opacity: number; // 0.2 - 0.5
  color: string;
}

export interface BurstHeart {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

const HEART_COLORS = [
  '#F43F5E', // Rose 500
  '#FB7185', // Rose 400
  '#EC4899', // Pink 500
  '#F472B6', // Pink 400
  '#FDA4AF', // Rose 300
  '#E11D48', // Rose 600
];

const createInitialHearts = (count: number): FloatingHeartParticle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: ((i * 17) % 94) + 3,
    size: ((i * 7) % 18) + 14,
    duration: ((i * 3) % 10) + 14,
    delay: (i * 0.8) % 8,
    swayAmount: ((i * 13) % 45) - 22,
    opacity: 0.25 + ((i % 5) * 0.05),
    color: HEART_COLORS[i % HEART_COLORS.length],
  }));
};

export const FloatingHearts: React.FC<{ count?: number }> = ({ count = 22 }) => {
  const [ambientHearts, setAmbientHearts] = useState<FloatingHeartParticle[]>(() =>
    createInitialHearts(count)
  );
  const [burstHearts, setBurstHearts] = useState<BurstHeart[]>([]);

  // Regenerate if count changes
  useEffect(() => {
    setAmbientHearts(createInitialHearts(count));
  }, [count]);

  // Handle click to spawn celebratory burst of micro hearts
  const handleWindowClick = useCallback((e: MouseEvent) => {
    // Only spawn if not clicking an input or textarea
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }

    const clickX = e.clientX;
    const clickY = e.clientY;
    const newBursts: BurstHeart[] = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: clickX,
      y: clickY,
      vx: (Math.random() - 0.5) * 80,
      vy: -Math.random() * 90 - 40,
      size: Math.floor(Math.random() * 12) + 12,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
    }));

    setBurstHearts((prev) => [...prev.slice(-15), ...newBursts]);
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, [handleWindowClick]);

  // Clean up burst hearts after 1.5s
  useEffect(() => {
    if (burstHearts.length === 0) return;
    const timer = setTimeout(() => {
      setBurstHearts((prev) => prev.slice(5));
    }, 1500);
    return () => clearTimeout(timer);
  }, [burstHearts]);

  return (
    <div
      data-testid="floating-hearts-layer"
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Drifting Ambient Hearts */}
      {ambientHearts.map((heart) => (
        <motion.div
          key={heart.id}
          data-testid={`floating-heart-${heart.id}`}
          className="absolute"
          style={{
            left: `${heart.x}%`,
            bottom: -50,
          }}
          animate={{
            y: ['0vh', '-110vh'],
            x: [0, heart.swayAmount, -heart.swayAmount, 0],
            rotate: [0, 15, -15, 0],
            opacity: [0, heart.opacity, heart.opacity, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width={heart.size}
            height={heart.size}
            fill={heart.color}
            stroke="none"
            className="filter drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}

      {/* Interactive Click Burst Hearts */}
      <AnimatePresence>
        {burstHearts.map((b) => (
          <motion.div
            key={b.id}
            initial={{
              x: b.x - b.size / 2,
              y: b.y - b.size / 2,
              scale: 0.2,
              opacity: 1,
            }}
            animate={{
              x: b.x + b.vx - b.size / 2,
              y: b.y + b.vy - b.size / 2,
              scale: [0.2, 1.2, 1],
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute"
          >
            <svg
              viewBox="0 0 24 24"
              width={b.size}
              height={b.size}
              fill={b.color}
              stroke="none"
              className="filter drop-shadow-[0_0_12px_rgba(251,113,133,0.8)]"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FloatingHearts;
