import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const particleColors = ['#e05a78', '#9b59b6', '#d4a017', '#fce4ec', '#e8d5f5'];

function createParticleConfig(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    key: `particle-${index}`,
    left: `${(index * 17) % 100}%`,
    top: `${(index * 29) % 100}%`,
    width: `${(index % 5) + 2}px`,
    height: `${(index % 5) + 2}px`,
    color: particleColors[index % particleColors.length],
    y: -30 - (index % 6) * 8,
    x: ((index % 7) - 3) * 6,
    duration: 4 + (index % 5),
    delay: (index % 5) * 0.6,
  }));
}

function createSparkleConfig(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    key: `sparkle-${index}`,
    left: `${(index * 19) % 100}%`,
    top: `${(index * 31) % 100}%`,
    duration: 2 + (index % 3),
    delay: (index % 4) * 0.5,
  }));
}

const BackgroundEffects: React.FC = () => {
  const isReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse), (orientation: landscape) and (max-height: 540px)').matches;
  const particleConfig = useMemo(() => createParticleConfig(isMobile ? 0 : 12), [isMobile]);
  const sparkleConfig = useMemo(() => createSparkleConfig(isMobile ? 0 : 8), [isMobile]);

  if (isReducedMotion || isMobile) {
    return <div className="bg-effects" aria-hidden="true" />;
  }

  return (
    <div className="bg-effects">
      <div className="blob blob-1">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="blob blob-2">
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -60, 0],
            opacity: [0.25, 0.45, 0.25]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="blob blob-3">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
            opacity: [0.2, 0.35, 0.2]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="particles">
        {particleConfig.map((particle) => (
          <motion.div
            key={particle.key}
            className="particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.width,
              height: particle.height,
              background: `linear-gradient(135deg, ${particle.color}, transparent)`,
            }}
            animate={{
              y: [0, particle.y],
              x: [0, particle.x],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      <div className="sparkles">
        {sparkleConfig.map((sparkle) => (
          <motion.div
            key={sparkle.key}
            className="sparkle"
            style={{
              left: sparkle.left,
              top: sparkle.top,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: sparkle.duration,
              repeat: Infinity,
              delay: sparkle.delay,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundEffects;
