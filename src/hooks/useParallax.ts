import { useState, useEffect } from 'react';

export function useParallax(speed: number = 0.1) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileQuery = window.matchMedia('(max-width: 768px)');

    if (reduceMotionQuery.matches || mobileQuery.matches) {
      setOffset(0);
      return;
    }

    let frameId = 0;

    const updateOffset = () => {
      setOffset(window.scrollY * speed);
      frameId = 0;
    };

    const handleScroll = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateOffset);
    };

    updateOffset();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [speed]);

  return offset;
}
