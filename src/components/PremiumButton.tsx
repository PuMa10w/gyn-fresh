import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type MotionButtonProps = React.ComponentPropsWithoutRef<typeof motion.button>;

interface PremiumButtonProps extends Omit<MotionButtonProps, 'children'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  shimmer?: boolean;
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  shimmer = true,
  type = 'button',
  ...buttonProps
}, forwardedRef) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [canUsePointerMotion, setCanUsePointerMotion] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle(forwardedRef, () => buttonRef.current as HTMLButtonElement);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateMotionMode = () => setCanUsePointerMotion(mediaQuery.matches);
    updateMotionMode();
    mediaQuery.addEventListener('change', updateMotionMode);
    return () => mediaQuery.removeEventListener('change', updateMotionMode);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || !canUsePointerMotion || prefersReducedMotion) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePosition({ x: x * 0.3, y: y * 0.3 });
  };

  return (
    <motion.button
      ref={buttonRef}
      className={`premium-button premium-button--${variant} premium-button--${size} ${className}`}
      type={type}
      onClick={onClick}
      onMouseEnter={() => {
        if (canUsePointerMotion && !prefersReducedMotion) setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      {...buttonProps}
      animate={{
        x: canUsePointerMotion && isHovered ? mousePosition.x : 0,
        y: canUsePointerMotion && isHovered ? mousePosition.y : 0,
        scale: canUsePointerMotion && isHovered ? 1.025 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      whileTap={{ scale: canUsePointerMotion && !prefersReducedMotion ? 0.97 : 1 }}
    >
      {shimmer && !prefersReducedMotion && (
        <motion.div
          className="premium-button-shimmer"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
      <span className="premium-button-content">{children}</span>
    </motion.button>
  );
});

PremiumButton.displayName = 'PremiumButton';
