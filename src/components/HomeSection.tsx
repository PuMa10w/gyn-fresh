import React, { useId } from 'react';
import { motion } from 'framer-motion';
import CommandSearch, { type WorkbenchCommand } from './CommandSearch';
import { PremiumBadge, PremiumCard } from './PremiumPrimitives';
import type { HistoryItem } from '../hooks/useHistory';
import type { TabType } from '../types';
import { repairText } from '../utils/textRepair';

export type HomeAction = {
  title: string;
  description: string;
  badge: string;
  onClick: (setActiveTab: (tab: TabType) => void, openQuestionnaire: () => void, openPharmacology: () => void) => void;
};

interface HomeSectionProps {
  actions: readonly HomeAction[];
  setActiveTab: (tab: TabType) => void;
  openQuestionnaire: () => void;
  openPharmacology: () => void;
  recentItems: HistoryItem[];
  onRecentOpen: (item: HistoryItem) => void;
  onFavoritesOpen: () => void;
  onHistoryOpen: () => void;
  favoriteCount: number;
  onCommandSearch: (command: WorkbenchCommand) => void;
}

const sectionNotes = {
  gynecology: ['МКБ-10', 'Диагностика', 'Лечение'],
  obstetrics: ['Протоколы', 'Маршруты', 'Осложнения'],
} as const;

const HomeSection = React.memo(function HomeSection({
  actions,
  setActiveTab,
  openQuestionnaire,
  openPharmacology,
  recentItems,
  onRecentOpen,
  onFavoritesOpen,
  onHistoryOpen,
  favoriteCount,
  onCommandSearch,
}: HomeSectionProps) {
  const titleId = useId();
  const primaryActions = actions.slice(0, 2);
  const toolActions = actions.slice(2);

  return (
    <motion.section
      className="home-shell"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      aria-labelledby={titleId}
    >
      <h1 className="visually-hidden" id={titleId}>Главная страница</h1>

      <section className="premium-command-hero" aria-label="Клинический центр управления">
        <div className="premium-command-copy">
          <PremiumBadge tone="gold">Клинический PWA</PremiumBadge>
          <h2>Ваш клинический навигатор</h2>
          <p>
            Быстрый вход в гинекологию, акушерство, шкалы и фармакологию без визуального шума: всё собрано в спокойном
            премиальном интерфейсе для работы с телефона.
          </p>
        </div>
        <CommandSearch onCommand={onCommandSearch} />
        <div className="premium-command-metrics" aria-label="Статус базы">
          <PremiumCard as="div" tone="default" className="premium-command-metric">
            <span>Покрытие базы</span>
            <strong>100%</strong>
            <small>клиническая структура карточек</small>
          </PremiumCard>
          <PremiumCard as="div" tone="default" className="premium-command-metric">
            <span>Избранное</span>
            <strong>{favoriteCount}</strong>
            <small>сохранённых карточек</small>
          </PremiumCard>
          <PremiumCard as="div" tone="default" className="premium-command-metric">
            <span>Ревизия</span>
            <strong>2026</strong>
            <small>контент с отметкой проверки</small>
          </PremiumCard>
        </div>
      </section>

      <section className="home-destination-grid" aria-label="Основные разделы">
        {primaryActions.map((item, index) => {
          const isGynecology = index === 0;
          const tags = isGynecology ? sectionNotes.gynecology : sectionNotes.obstetrics;

          return (
            <motion.button
              key={item.title}
              type="button"
              className={`home-destination-card ${isGynecology ? 'is-gynecology' : 'is-obstetrics'}`}
              onClick={() => item.onClick(setActiveTab, openQuestionnaire, openPharmacology)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index, duration: 0.28 }}
            >
              <div className="destination-head">
                <span className="destination-kicker">{isGynecology ? 'Основной раздел' : 'Беременность и наблюдение'}</span>
                <span className="destination-index">{isGynecology ? '01' : '02'}</span>
              </div>
              <div className="destination-main">
                <h2 className="home-destination-title">{repairText(item.title)}</h2>
                <p className="home-destination-description">{repairText(item.description)}</p>
              </div>
              <div className="destination-footer">
                <div className="destination-tags">
                  {tags.map((tag) => <span key={tag} className="destination-tag">{tag}</span>)}
                </div>
                <span className="destination-arrow" aria-hidden="true">→</span>
              </div>
            </motion.button>
          );
        })}
      </section>

      <section className="premium-command-grid" aria-label="Клинические инструменты">
        {toolActions.map((item) => (
          <PremiumCard as="article" key={item.title} className="premium-tool-card">
            <PremiumBadge tone="neutral">{repairText(item.badge)}</PremiumBadge>
            <h3>{repairText(item.title)}</h3>
            <p>{repairText(item.description)}</p>
            <button type="button" className="premium-inline-action" onClick={() => item.onClick(setActiveTab, openQuestionnaire, openPharmacology)}>
              Открыть
            </button>
          </PremiumCard>
        ))}

        <PremiumCard as="article" className="premium-tool-card">
          <PremiumBadge tone="neutral">Навигация</PremiumBadge>
          <h3>Избранное и история</h3>
          <p>Возвращайтесь к важным карточкам без повторного поиска, особенно на мобильном при работе одной рукой.</p>
          <div className="premium-tool-actions">
            <button type="button" className="premium-inline-action" onClick={onFavoritesOpen}>Открыть избранное</button>
            <button type="button" className="premium-inline-action" onClick={onHistoryOpen}>История</button>
          </div>
        </PremiumCard>
      </section>

      {recentItems.length > 0 ? (
        <section className="premium-recent-panel" aria-label="Недавно открытые">
          <div className="premium-section-head">
            <PremiumBadge tone="neutral">Недавно</PremiumBadge>
            <h3>Открытые карточки</h3>
          </div>
          <div className="premium-recent-list">
            {recentItems.map((item) => (
              <button key={item.id} type="button" className="premium-recent-item" onClick={() => onRecentOpen(item)}>
                <span>{repairText(item.name)}</span>
                <small>{repairText(item.subtitle)}</small>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </motion.section>
  );
});

export default HomeSection;
