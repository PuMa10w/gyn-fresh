import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumButton } from './PremiumButton';

interface SymptomCheckerProps {
  onSelectDisease?: (icdCode: string) => void;
  className?: string;
}

const COMMON_SYMPTOMS = [
  'Боль внизу живота',
  'Нарушение менструального цикла',
  'Аномальные маточные кровотечения',
  'Боль при половом акте',
  'Выделения из половых путей',
  'Зуд и жжение',
  'Тазовая боль',
  'Дизурия',
  'Бесплодие',
  'Объёмное образование в малом тазу',
  'Аменорея',
  'Дисменорея',
  'Межменструальные кровянистые выделения',
];

const SYMPTOM_TO_DISEASE: Record<string, Array<{ code: string; name: string; probability: number }>> = {
  'Боль внизу живота': [
    { code: 'N70', name: 'Сальпингит и оофорит', probability: 0.8 },
    { code: 'N73', name: 'Воспалительные заболевания органов малого таза', probability: 0.6 },
    { code: 'N94.6', name: 'Дисменорея', probability: 0.5 },
  ],
  'Аномальные маточные кровотечения': [
    { code: 'N92', name: 'Обильные, частые и нерегулярные менструации', probability: 0.9 },
    { code: 'N93', name: 'Аномальные маточные и влагалищные кровотечения', probability: 0.85 },
    { code: 'N84', name: 'Полипы матки и шейки матки', probability: 0.6 },
  ],
  'Нарушение менструального цикла': [
    { code: 'N91', name: 'Отсутствие, скудные и редкие менструации', probability: 0.85 },
    { code: 'N92', name: 'Обильные, частые и нерегулярные менструации', probability: 0.7 },
  ],
  Бесплодие: [
    { code: 'N97', name: 'Женское бесплодие', probability: 0.95 },
    { code: 'N70', name: 'Сальпингит и оофорит', probability: 0.6 },
    { code: 'N80', name: 'Эндометриоз', probability: 0.55 },
  ],
  'Выделения из половых путей': [
    { code: 'N76', name: 'Воспалительные болезни влагалища и вульвы', probability: 0.8 },
    { code: 'N70', name: 'Сальпингит и оофорит', probability: 0.5 },
  ],
  'Тазовая боль': [
    { code: 'N80', name: 'Эндометриоз', probability: 0.82 },
    { code: 'N73', name: 'Воспалительные заболевания органов малого таза', probability: 0.7 },
    { code: 'N70', name: 'Сальпингит и оофорит', probability: 0.65 },
  ],
  Дисменорея: [
    { code: 'N80', name: 'Эндометриоз', probability: 0.74 },
    { code: 'N94.6', name: 'Дисменорея неуточнённая', probability: 0.68 },
  ],
};

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  onSelectDisease,
  className = '',
}) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => (prev.includes(symptom) ? prev.filter((entry) => entry !== symptom) : [...prev, symptom]));
    setShowResults(false);
  };

  const results = useMemo(() => {
    if (selectedSymptoms.length === 0) return [];

    const diseaseScores: Record<string, { code: string; name: string; score: number }> = {};
    selectedSymptoms.forEach((symptom) => {
      const diseases = SYMPTOM_TO_DISEASE[symptom];
      diseases?.forEach((disease) => {
        if (!diseaseScores[disease.code]) diseaseScores[disease.code] = { code: disease.code, name: disease.name, score: 0 };
        diseaseScores[disease.code].score += disease.probability;
      });
    });

    return Object.values(diseaseScores).sort((a, b) => b.score - a.score).slice(0, 5);
  }, [selectedSymptoms]);

  return (
    <motion.section
      className={`symptom-checker clinical-tool-surface ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <header className="clinical-tool-header">
        <span className="clinical-tool-eyebrow">Навигационный помощник</span>
        <h3>AI-диагност по симптомам</h3>
        <p>Выберите симптомы пациентки. Система покажет вероятные направления дифференциального поиска и коды МКБ.</p>
      </header>

      <div className="symptom-chip-grid" aria-label="Выбор симптомов">
        {COMMON_SYMPTOMS.map((symptom) => (
          <button
            key={symptom}
            type="button"
            className={`symptom-chip ${selectedSymptoms.includes(symptom) ? 'is-selected' : ''}`}
            onClick={() => toggleSymptom(symptom)}
          >
            {symptom}
          </button>
        ))}
      </div>

      <div className="clinical-tool-actions">
        <PremiumButton onClick={() => setShowResults(true)} variant="primary" shimmer={selectedSymptoms.length > 0} disabled={selectedSymptoms.length === 0}>
          Анализировать ({selectedSymptoms.length})
        </PremiumButton>
        {selectedSymptoms.length > 0 ? (
          <PremiumButton
            onClick={() => {
              setSelectedSymptoms([]);
              setShowResults(false);
            }}
            variant="ghost"
            size="sm"
          >
            Очистить
          </PremiumButton>
        ) : null}
      </div>

      {showResults && results.length > 0 ? (
        <motion.div className="symptom-results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h4>Вероятные направления</h4>
          {results.map((result, index) => (
            <article key={result.code} className={`symptom-result-card ${index === 0 ? 'is-top' : ''}`}>
              <div>
                <strong>{result.name}</strong>
                <span>МКБ-10: {result.code}</span>
              </div>
              <div className="symptom-score">{Math.round(result.score * 100)}%</div>
              {onSelectDisease ? (
                <button type="button" className="symptom-open-link" onClick={() => onSelectDisease(result.code)}>
                  Открыть
                </button>
              ) : null}
            </article>
          ))}
          <p className="clinical-tool-note">Это ориентировочная навигация, а не диагноз. Итоговое решение требует осмотра и подтверждающей диагностики.</p>
        </motion.div>
      ) : null}

      {showResults && results.length === 0 ? (
        <div className="clinical-tool-empty">Недостаточно данных для подсказки. Добавьте ещё один симптом или используйте поиск по каталогу.</div>
      ) : null}
    </motion.section>
  );
};
