import React from 'react';
import { motion } from 'framer-motion';

interface NavItem {
  path: string;
  label: string;
}

interface MobileBottomBarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Главная' },
  { path: '/gynecology', label: 'Гинекология' },
  { path: '/obstetrics', label: 'Акушерство' },
  { path: '/bookmarks', label: 'Закладки' },
];

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ currentPath, onNavigate }) => {
  return (
    <motion.nav
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="mobile-bottom-bar"
      aria-label="Нижняя навигация"
    >
      <div className="mobile-bottom-items">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <motion.button
              key={item.path}
              type="button"
              onClick={() => onNavigate(item.path)}
              className={`mobile-bottom-item ${isActive ? 'is-active' : ''}`}
              whileTap={{ scale: 0.97 }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="mobile-bottom-label">{item.label}</span>
              {isActive ? <motion.span className="mobile-bottom-active-line" layoutId="bottomActiveLine" /> : null}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};
