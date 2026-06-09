import React from 'react';
import { motion } from 'framer-motion';
import { gynIcons, obsIcons } from './Icons';
import { PremiumBadge } from './PremiumPrimitives';
import type { Disease } from '../types';
import { isObstetricsLabel, repairText } from '../utils/textRepair';

interface DiseaseCardProps {
  item: Disease;
  onClick: (item: Disease) => void;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (diseaseId: string) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.995 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: Math.min(index * 0.025, 0.18),
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const riskLabel: Record<string, string> = {
  low: 'низкий риск',
  moderate: 'умеренный риск',
  high: 'высокий риск',
  critical: 'срочно',
};

const formatReviewed = (value: string) => {
  const repaired = repairText(value);
  return repaired.toLowerCase().includes('clinical content review') ? 'клиническая ревизия 2026' : repaired;
};

const DiseaseCard = React.memo(function DiseaseCard({ item, onClick, index, isFavorite, onToggleFavorite }: DiseaseCardProps) {
  const IconComponent =
    (gynIcons as Record<string, React.ReactNode>)[item.icon] ??
    (obsIcons as Record<string, React.ReactNode>)[item.icon];
  const subtitle = item.icd?.startsWith('O') ? 'Акушерство' : repairText(item.subtitle);
  const icdLabel = repairText(item.icdDetail ?? item.icd);
  const riskLevel = item.overview?.riskLevel ?? (item.icd?.startsWith('O') || isObstetricsLabel(item.subtitle) ? 'high' : 'moderate');
  const quickSummary = repairText(item.clinicalSummary?.quickSummary ?? item.overview?.quickTake ?? item.description);
  const name = repairText(item.name);

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleFavorite(item.id);
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(item);
    }
  };

  return (
    <motion.article
      className="disease-card"
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onClick(item)}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${name}, код ${icdLabel}. Открыть подробности.`}
    >
      <header className="card-header">
        <div className="card-meta-row">
          <span className="card-subtitle">{subtitle}</span>
          <span className="card-icd-badge">{icdLabel}</span>
        </div>
        <button
          type="button"
          className={`favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? `Убрать ${name} из избранного` : `Добавить ${name} в избранное`}
          title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          <span className="favorite-icon" aria-hidden="true">
            {isFavorite ? '♥' : '♡'}
          </span>
        </button>
      </header>

      <div className="card-body">
        <div className="card-icon-wrap">
          <span className="card-icon" aria-hidden="true">
            {IconComponent && <span className="card-icon-art">{IconComponent}</span>}
          </span>
        </div>
        <h3 className="card-title">{name}</h3>
        <p className="card-desc">{quickSummary}</p>
        <div className="premium-card-badges" aria-label="Клинические метки">
          <PremiumBadge tone={riskLevel === 'high' || riskLevel === 'critical' ? 'rose' : 'gold'}>
            {riskLabel[riskLevel] ?? repairText(riskLevel)}
          </PremiumBadge>
          {item.lastReviewed ? <PremiumBadge tone="neutral">Обновлено {formatReviewed(item.lastReviewed)}</PremiumBadge> : null}
        </div>
      </div>
    </motion.article>
  );
});

export default DiseaseCard;
