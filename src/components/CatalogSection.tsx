import React, { useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import DiseaseCard from './DiseaseCard';
import type { CategoryId, Disease } from '../types';

type SortMode = 'relevance' | 'urgent' | 'reviewed' | 'source' | 'alpha';

const sortOptions: Array<{ id: SortMode; label: string }> = [
  { id: 'relevance', label: 'Релевантность' },
  { id: 'urgent', label: 'Срочность' },
  { id: 'reviewed', label: 'Ревизия' },
  { id: 'source', label: 'Источник' },
  { id: 'alpha', label: 'А-Я' },
];

const riskScore = (item: Disease) => {
  const risk = String(item.overview?.riskLevel ?? item.sourceConfidence?.level ?? '').toLowerCase();
  if (/critical|сроч|urgent|high/.test(risk)) return 4;
  if (/moderate|attention|контроль|limited/.test(risk)) return 3;
  if (/low|routine|план/.test(risk)) return 2;
  return 1;
};

const sourceScore = (item: Disease) => {
  const level = String(item.sourceQuality?.level ?? item.editorialStatus ?? '').toLowerCase();
  if (level === 'verified') return 4;
  if (level === 'reviewed') return 3;
  if (level === 'needs-source-review') return 2;
  return 1;
};

const reviewTime = (item: Disease) => {
  const value = item.lastReviewed ? Date.parse(item.lastReviewed) : 0;
  return Number.isFinite(value) ? value : 0;
};

type SectionMeta = {
  eyebrow: string;
  title: string;
  description: string;
  loadingTitle: string;
};

type EmptyState = {
  eyebrow: string;
  title: string;
  description: string;
};

interface CatalogSectionProps {
  activeSectionMeta: SectionMeta;
  isDataLoading: boolean;
  error: string | null;
  onRetry: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredData: Disease[];
  activeCategory: CategoryId;
  setActiveCategory: (value: CategoryId) => void;
  categoryCounts: Record<Exclude<CategoryId, 'all'>, number>;
  visibleCategories: CategoryId[];
  onItemClick: (item: Disease) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  emptyState: EmptyState;
}

const CatalogSection = React.memo(function CatalogSection({
  activeSectionMeta,
  isDataLoading,
  error,
  onRetry,
  searchTerm,
  setSearchTerm,
  filteredData,
  activeCategory,
  setActiveCategory,
  categoryCounts,
  visibleCategories,
  onItemClick,
  isFavorite,
  onToggleFavorite,
  emptyState,
}: CatalogSectionProps) {
  const titleId = useId();
  const sortLabelId = useId();
  const [sortMode, setSortMode] = useState<SortMode>('relevance');
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const animDuration = isMobile ? 0.14 : 0.22;
  const sortedData = useMemo(() => {
    const entries = filteredData.map((item, index) => ({ item, index }));

    entries.sort((a, b) => {
      if (sortMode === 'urgent') return riskScore(b.item) - riskScore(a.item) || a.index - b.index;
      if (sortMode === 'reviewed') return reviewTime(b.item) - reviewTime(a.item) || a.index - b.index;
      if (sortMode === 'source') return sourceScore(b.item) - sourceScore(a.item) || a.index - b.index;
      if (sortMode === 'alpha') return a.item.name.localeCompare(b.item.name, 'ru') || a.index - b.index;
      return a.index - b.index;
    });

    return entries.map((entry) => entry.item);
  }, [filteredData, sortMode]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: animDuration, ease: 'easeOut' }}
      aria-labelledby={titleId}
    >
      <section className="catalog-shell" aria-busy={isDataLoading}>
        <header className="catalog-header">
          <span className="catalog-eyebrow">{activeSectionMeta.eyebrow}</span>
          <h1 className="catalog-title" id={titleId}>
            {activeSectionMeta.title}
          </h1>
          <p className="catalog-description">{activeSectionMeta.description}</p>
        </header>

        <div className="catalog-controls">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            resultCount={isDataLoading || error ? undefined : filteredData.length}
          />
          <CategoryFilter
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            categoryCounts={categoryCounts}
            visibleCategories={visibleCategories}
          />
          <div className="catalog-sort-bar" aria-labelledby={sortLabelId}>
            <span id={sortLabelId} className="catalog-sort-label">Сортировка</span>
            <div className="catalog-sort-options" role="group" aria-label="Сортировка клинических карточек">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`catalog-sort-chip ${sortMode === option.id ? 'is-active' : ''}`}
                  aria-pressed={sortMode === option.id}
                  onClick={() => setSortMode(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-live="polite" className="cards-grid">
        {error && (
          <motion.div className="catalog-status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <span className="catalog-status-eyebrow">Ошибка загрузки</span>
            <h2>Раздел временно недоступен</h2>
            <p>{error}</p>
            <button type="button" className="q-btn q-btn-primary" onClick={onRetry}>
              Повторить загрузку
            </button>
          </motion.div>
        )}

        {isDataLoading && (
          <>
            <motion.div className="catalog-status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <span className="catalog-status-eyebrow">Загрузка</span>
              <h2>{activeSectionMeta.loadingTitle}</h2>
              <p>Подготавливаем карточки и клинические блоки. При первом открытии это может занять несколько секунд.</p>
            </motion.div>
            <div className="skeleton-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="skeleton-card" />
              ))}
            </div>
          </>
        )}

        {!isDataLoading &&
          !error &&
          sortedData.map((item, index) => (
            <DiseaseCard
              key={item.id}
              item={item}
              onClick={onItemClick}
              index={index}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}

        {!isDataLoading && !error && sortedData.length === 0 && (
          <motion.div className="empty-state" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <span className="empty-eyebrow">{emptyState.eyebrow}</span>
            <h3>{emptyState.title}</h3>
            <p>{emptyState.description}</p>
            {(searchTerm.trim() || activeCategory !== 'all') && (
              <div className="empty-state-actions" aria-label="Быстрые действия поиска">
                {searchTerm.trim() && (
                  <button type="button" className="empty-state-action" onClick={() => setSearchTerm('')}>
                    Очистить поиск
                  </button>
                )}
                {activeCategory !== 'all' && (
                  <button type="button" className="empty-state-action" onClick={() => setActiveCategory('all')}>
                    Все разделы
                  </button>
                )}
              </div>
            )}
            <ul className="empty-state-hints" aria-label="Подсказки для поиска">
              <li>Попробуйте код МКБ, например N80 или O46.</li>
              <li>Ищите по симптому: боль, кровотечение, зуд, беременность.</li>
              <li>Можно использовать русское или латинское название.</li>
            </ul>
          </motion.div>
        )}
      </section>
    </motion.section>
  );
});

export default CatalogSection;
