import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ThemeMode } from '../hooks/useTheme';
import type { TabType } from '../types';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onQuestionnaires: () => void;
  onPharmacology: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  showFavorites: boolean;
  onFavoritesToggle: () => void;
  showHistory: boolean;
  onHistoryToggle: () => void;
}

const navTransition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

const Navbar = React.memo(function Navbar({
  activeTab,
  onTabChange,
  onQuestionnaires,
  onPharmacology,
  theme,
  toggleTheme,
  showFavorites,
  onFavoritesToggle,
  showHistory,
  onHistoryToggle,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const runMenuAction = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <motion.nav
      className="navbar glass"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={navTransition}
      aria-label="Главная навигация"
    >
      <div className="navbar-inner">
        <div className="navbar-topline">
          <button
            type="button"
            className="navbar-brand group"
            onClick={() => onTabChange('home')}
            aria-label="Перейти на главную"
          >
            <span className="navbar-brand-mark" aria-hidden="true">GYN</span>
            <span className="navbar-brand-copy">
              <strong>GYN</strong>
              <span>гинекология и акушерство</span>
            </span>
          </button>

          <div className="navbar-utility-actions">
            <button type="button" className="navbar-icon-button" onClick={toggleTheme} aria-label="Переключить тему">
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <button
              type="button"
              className={`navbar-icon-button ${isMenuOpen ? 'is-active' : ''}`}
              onClick={() => setIsMenuOpen((value) => !value)}
              aria-label="Открыть быстрые действия"
              aria-expanded={isMenuOpen}
            >
              ⋯
            </button>
          </div>

          <div className="navbar-actions" role="toolbar" aria-label="Быстрые действия">
            <button type="button" className="navbar-action-button" onClick={onQuestionnaires} aria-label="Открыть опросники">
              Шкалы
            </button>
            <button type="button" className="navbar-action-button" onClick={onPharmacology} aria-label="Открыть фармакологию">
              Фарма
            </button>
            <button
              type="button"
              className={`navbar-action-button ${showFavorites ? 'is-active' : ''}`}
              onClick={onFavoritesToggle}
              aria-label="Избранное"
            >
              Избранное
            </button>
            <button
              type="button"
              className={`navbar-action-button ${showHistory ? 'is-active' : ''}`}
              onClick={onHistoryToggle}
              aria-label="История"
            >
              История
            </button>
          </div>

          <AnimatePresence>
            {isMenuOpen ? (
              <motion.div
                className="navbar-overflow-menu"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={navTransition}
                role="menu"
              >
                <button type="button" role="menuitem" onClick={() => runMenuAction(onQuestionnaires)}>Шкалы</button>
                <button type="button" role="menuitem" onClick={() => runMenuAction(onPharmacology)}>Фарма</button>
                <button type="button" role="menuitem" onClick={() => runMenuAction(onFavoritesToggle)}>
                  {showFavorites ? 'Скрыть закладки' : 'Закладки'}
                </button>
                <button type="button" role="menuitem" onClick={() => runMenuAction(onHistoryToggle)}>
                  {showHistory ? 'Скрыть историю' : 'История'}
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="nav-row nav-row-primary" aria-label="Основные разделы">
          <div className="nav-scroll">
            <button type="button" onClick={() => onTabChange('home')} className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}>Главная</button>
            <button type="button" onClick={() => onTabChange('gynecology')} className={`nav-tab ${activeTab === 'gynecology' ? 'active' : ''}`}>Гинекология</button>
            <button type="button" onClick={() => onTabChange('obstetrics')} className={`nav-tab ${activeTab === 'obstetrics' ? 'active' : ''}`}>Акушерство</button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
});

export default Navbar;
