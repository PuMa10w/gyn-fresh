import React, { useEffect, useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumButton } from './PremiumButton';
import { questionnaires } from '../data/questionnaires';
import { useModalBehavior } from '../hooks/useModalBehavior';
import type { QuestionnaireData, ScoringResult, QuestionnaireHistory } from '../types';
import { repairText } from '../utils/textRepair';

const QUESTIONNAIRE_HISTORY_KEY = 'questionnaire-history';

const renderCompactList = (items?: string[]): React.ReactNode =>
  items?.length ? (
    <ul className="q-clinical-list">
      {items.map((entry, index) => (
        <li key={index}>{entry}</li>
      ))}
    </ul>
  ) : null;

const normalizeHistory = (items: unknown): QuestionnaireHistory[] =>
  Array.isArray(items)
    ? items.map((entry) => {
        const item = entry as QuestionnaireHistory;
        return {
          ...item,
          name: repairText(item.name),
          fullName: repairText(item.fullName),
          level: repairText(item.level),
          severity: repairText(item.severity),
          date: repairText(item.date),
        };
      })
    : [];

const severityBucket = (severity: string): keyof NonNullable<QuestionnaireData['nextStepByScore']> => {
  if (severity === 'critical') return 'critical';
  if (severity === 'severe') return 'high';
  if (severity === 'moderate') return 'intermediate';
  return 'low';
};

const buildUrgentCriteria = (questionnaire: QuestionnaireData, result: ScoringResult): string[] => {
  if (questionnaire.urgentCriteria?.length) return questionnaire.urgentCriteria.map(repairText);
  if (result.severity === 'critical' || result.severity === 'severe') {
    return [
      'Быстрое ухудшение состояния, выраженная боль, обморок или кровотечение требуют срочной очной оценки.',
      'Если результат противоречит клинической картине, ориентируйтесь на безопасность пациентки, а не только на баллы.',
    ];
  }
  return ['При появлении красных флагов балл шкалы не заменяет срочную медицинскую оценку.'];
};

interface QuestionnaireProps {
  onClose: () => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onClose }) => {
  const titleId = useId();
  const subtitleId = useId();
  const questionId = useId();
  const optionsId = useId();
  const { modalRef, closeButtonRef, handleModalKeyDown } = useModalBehavior(onClose);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedQ, setSelectedQ] = useState<QuestionnaireData | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<QuestionnaireHistory[]>(() => {
    try {
      return normalizeHistory(JSON.parse(localStorage.getItem(QUESTIONNAIRE_HISTORY_KEY) || '[]'));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(QUESTIONNAIRE_HISTORY_KEY, JSON.stringify(history));
    }
  }, [history]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateViewportMode = () => setIsMobile(mediaQuery.matches);

    updateViewportMode();
    mediaQuery.addEventListener('change', updateViewportMode);

    return () => mediaQuery.removeEventListener('change', updateViewportMode);
  }, []);

  const score = useMemo(() => Object.values(answers).reduce((a, b) => a + b, 0), [answers]);

  const previousSameQuestionnaire = useMemo(() => {
    if (!selectedQ || !result) return null;
    return history.find((entry) => entry.id === selectedQ.id && entry.score !== score) ?? null;
  }, [history, result, score, selectedQ]);

  const dynamicsLabel = useMemo(() => {
    if (!previousSameQuestionnaire) return 'Это первое сохранённое прохождение этой шкалы.';
    const delta = score - previousSameQuestionnaire.score;
    if (delta === 0) return `Динамика без изменений относительно ${previousSameQuestionnaire.date}.`;
    return `${delta > 0 ? 'Рост' : 'Снижение'} на ${Math.abs(delta)} балл(а) относительно ${previousSameQuestionnaire.date}.`;
  }, [previousSameQuestionnaire, score]);

  const startQuestionnaire = (q: QuestionnaireData): void => {
    setSelectedQ(q);
    setAnswers({});
    setCurrentStep(0);
    setResult(null);
    setCopied(false);
  };

  const setAnswer = (qIndex: number, value: number): void => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const calculateResult = (): void => {
    if (!selectedQ) return;

    const answerArray = selectedQ.questions.map((_, index) => answers[index] ?? 0);
    const scoringResult: ScoringResult = selectedQ.scoring(answerArray);
    setResult(scoringResult);

    const historyEntry: QuestionnaireHistory = {
      id: selectedQ.id,
      name: selectedQ.name,
      fullName: selectedQ.fullName,
      date: new Date().toLocaleDateString('ru-RU'),
      score: answerArray.reduce((a, b) => a + b, 0),
      level: scoringResult.level,
      severity: scoringResult.severity,
      color: scoringResult.color,
    };

    const updatedHistory = [historyEntry, ...history].slice(0, 20);
    setHistory(updatedHistory);
  };

  const clearHistory = (): void => {
    setHistory([]);
    localStorage.removeItem(QUESTIONNAIRE_HISTORY_KEY);
  };

  const closeResults = (): void => {
    setResult(null);
    setSelectedQ(null);
    setAnswers({});
    setCurrentStep(0);
    setCopied(false);
  };

  const copyResultSummary = async (): Promise<void> => {
    if (!selectedQ || !result) return;

    const maxScore = selectedQ.questions.length * (selectedQ.options.length - 1);
    const summary = [
      `${selectedQ.name}: ${result.level}`,
      `Баллы: ${score} из ${maxScore}`,
      `Профессиональное заключение: ${result.recommendation}`,
      `Следующие шаги: ${(selectedQ.nextStepByScore?.[severityBucket(result.severity)] ?? []).slice(0, 3).join('; ') || 'сверить с клинической картиной и планом врача'}`,
      `Ограничения: ${(selectedQ.limitations ?? []).slice(0, 2).join('; ') || 'шкала не заменяет очную диагностику'}`,
      `Динамика: ${dynamicsLabel}`,
      `Дата: ${new Date().toLocaleDateString('ru-RU')}`,
    ].join('\n');

    try {
      await navigator.clipboard?.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const goBack = (): void => {
    if (result) {
      setResult(null);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      return;
    }
    setSelectedQ(null);
  };

  const goNext = (): void => {
    if (currentStep < selectedQ!.questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      calculateResult();
    }
  };

  if (!selectedQ) {
    return (
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`modal-content questionnaire-modal ${isMobile ? 'mobile-sheet' : ''}`}
          initial={isMobile ? { y: '100%' } : { scale: 0.9, y: 50 }}
          animate={isMobile ? { y: 0 } : { scale: 1, y: 0 }}
          exit={isMobile ? { y: '100%' } : { scale: 0.9, y: 50 }}
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleModalKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={subtitleId}
        >
          <div className="modal-header">
            <div>
              <h2 className="modal-title" id={titleId}>Шкалы и опросники</h2>
              <div className="modal-icd" id={subtitleId}>Выберите шкалу для структурированной клинической оценки</div>
            </div>
            <PremiumButton
              ref={closeButtonRef}
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="modal-close"
              shimmer={false}
              aria-label="Закрыть опросники"
            >
              ×
            </PremiumButton>
          </div>

          <div className="q-list">
            {questionnaires.map((q, index) => (
              <motion.article
                key={q.id}
                className="q-card glass"
                style={{
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => startQuestionnaire(q)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    startQuestionnaire(q);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Открыть опросник: ${q.name}`}
              >
                <div className="q-icon" aria-hidden="true">{q.icon}</div>
                <div className="q-info">
                  <h3>{q.name}</h3>
                  <div className="q-cat">{q.category}</div>
                  <div className="q-desc">{q.description}</div>
                  <div className="q-count">{q.questions.length} вопросов</div>
                  <div className="q-clinical-note">
                    {q.clinicalPurpose?.screening?.[0] ?? 'Клиническая шкала для структурированной оценки симптомов.'}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="q-history">
            <div className="q-history-header">
              <h3>История прохождений</h3>
              {history.length > 0 && (
                <PremiumButton
                  onClick={clearHistory}
                  variant="secondary"
                  size="sm"
                  shimmer={false}
                >
                  Очистить историю
                </PremiumButton>
              )}
            </div>

            {history.length > 0 ? (
              <div className="q-history-list">
                {history.map((h, i) => (
                  <div key={i} className="q-history-item" style={{ borderLeftColor: h.color }}>
                    <div className="q-h-name">{h.name} - {h.level}</div>
                    <div className="q-h-date">{h.date}</div>
                    <div className="q-h-score">Баллы: {h.score}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="q-history-empty">История пока пустая. После первого прохождения результаты появятся здесь.</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (!result) {
    const progress = (Object.keys(answers).length / selectedQ.questions.length) * 100;
    return (
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`modal-content questionnaire-modal ${isMobile ? 'mobile-sheet' : ''}`}
          initial={isMobile ? { y: '100%' } : { scale: 0.9, y: 50 }}
          animate={isMobile ? { y: 0 } : { scale: 1, y: 0 }}
          exit={isMobile ? { y: '100%' } : { scale: 0.9, y: 50 }}
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleModalKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={subtitleId}
        >
          <div className="modal-header">
            <div>
              <h2 className="modal-title" id={titleId}>{selectedQ.icon} {selectedQ.name}</h2>
              <div className="modal-icd" id={subtitleId}>{selectedQ.fullName}</div>
            </div>
            <PremiumButton
              ref={closeButtonRef}
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="modal-close"
              shimmer={false}
              aria-label="Закрыть шкалу"
            >
              ×
            </PremiumButton>
          </div>

          <div
            className="q-progress-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Прогресс прохождения опросника"
          >
            <div
              className="q-progress-fill"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(135deg, var(--peach-coral, #E8A08C), var(--peach-rose, #D89AA7))'
              }}
            />
          </div>

          <div className="q-clinical-panel">
            <h3>Клиническое назначение</h3>
            {renderCompactList(selectedQ.clinicalPurpose?.screening)}
            {selectedQ.targetPopulation?.intendedFor?.length ? (
              <>
                <h4>Для кого</h4>
                {renderCompactList(selectedQ.targetPopulation.intendedFor)}
              </>
            ) : null}
          </div>

          <div className="q-steps" aria-label="Шаги опросника">
            {selectedQ.questions.map((_, i) => (
              <div
                key={i}
                className={`q-step ${i === currentStep ? 'active' : ''} ${answers[i] !== undefined ? 'done' : ''}`}
                aria-current={i === currentStep ? 'step' : undefined}
                aria-label={`Шаг ${i + 1}${answers[i] !== undefined ? ', заполнен' : ''}`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          <div className="q-question">
            <h3 id={questionId}>Вопрос {currentStep + 1} из {selectedQ.questions.length}</h3>
            <p>{selectedQ.questions[currentStep]}</p>
          </div>

          <div className="q-options" id={optionsId} role="radiogroup" aria-labelledby={questionId}>
            {selectedQ.options.map((opt, i) => (
              <motion.button
                key={i}
                type="button"
                className={`q-option ${answers[currentStep] === i ? 'selected' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAnswer(currentStep, i)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setAnswer(currentStep, i);
                  }
                }}
                role="radio"
                aria-checked={answers[currentStep] === i}
                tabIndex={answers[currentStep] === i || (answers[currentStep] === undefined && i === 0) ? 0 : -1}
              >
                {opt}
              </motion.button>
            ))}
          </div>

          <div className="q-nav">
            <PremiumButton
              onClick={goBack}
              variant="secondary"
              size="md"
              disabled={currentStep === 0}
              shimmer={false}
            >
              ← Назад
            </PremiumButton>

            <PremiumButton
              onClick={goNext}
              variant="primary"
              size="md"
              disabled={answers[currentStep] === undefined}
              shimmer={true}
            >
              {currentStep === selectedQ.questions.length - 1 ? 'Получить результат →' : 'Далее →'}
            </PremiumButton>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`modal-content questionnaire-modal ${isMobile ? 'mobile-sheet' : ''}`}
        initial={isMobile ? { y: '100%' } : { scale: 0.9, y: 50 }}
        animate={isMobile ? { y: 0 } : { scale: 1, y: 0 }}
        exit={isMobile ? { y: '100%' } : { scale: 0.9, y: 50 }}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleModalKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitleId}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title" id={titleId}>Результат</h2>
            <div className="modal-icd" id={subtitleId}>{selectedQ.name} - {selectedQ.fullName}</div>
          </div>
          <PremiumButton
            ref={closeButtonRef}
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="modal-close"
            shimmer={false}
            aria-label="Закрыть результат"
          >
            ×
          </PremiumButton>
        </div>

        <div className="q-result">
          <div className="q-result-badge" style={{ background: result.color }}>
            <div className="q-result-level">{result.level}</div>
            <div className="q-result-score">
              Баллы: {score} из {selectedQ.questions.length * (selectedQ.options.length - 1)}
            </div>
          </div>

          <div className="q-severity-bar">
            {['normal', 'mild', 'moderate', 'severe', 'critical'].map((sev, i) => {
              const labels = ['Норма', 'Лёгкая', 'Умеренная', 'Тяжёлая', 'Критическая'];
              const colors = ['#B9DCC7', '#F0D7A2', '#E8B48F', '#D89AA7', '#C76F7A'];
              return (
                <div
                  key={sev}
                  className={`q-seg ${result.severity === sev ? 'active' : ''}`}
                  style={{ background: result.severity === sev ? colors[i] : '#eee' }}
                >
                  {labels[i]}
                </div>
              );
            })}
          </div>

          <div className="q-recommendation">
            <h4>Профессиональное заключение</h4>
            <p>
              Итог шкалы требует клинической интерпретации вместе с анамнезом, осмотром,
              факторами риска и клинической безопасностью пациентки.
            </p>
            {selectedQ.resultSummaryTemplate ? <p>{selectedQ.resultSummaryTemplate}</p> : null}
          </div>

          <div className="q-recommendation">
            <h4>Рекомендация</h4>
            <p>{result.recommendation}</p>
          </div>

          <div className="q-clinical-panel q-dynamics-panel">
            <h4>Динамика</h4>
            <p>{dynamicsLabel}</p>
          </div>

          <div className="q-clinical-panel">
            <h4>Следующие шаги</h4>
            {renderCompactList([
              ...(selectedQ.nextStepByScore?.[severityBucket(result.severity)] ?? []),
              ...(result.severity === 'critical' ? selectedQ.nextStepByScore?.high ?? [] : []),
            ].slice(0, 5))}
          </div>

          <div className="q-clinical-panel q-urgent-panel">
            <h4>Когда действовать срочно</h4>
            {renderCompactList(buildUrgentCriteria(selectedQ, result))}
          </div>

          <div className="q-clinical-panel">
            <h4>Ограничения интерпретации</h4>
            {renderCompactList(selectedQ.limitations)}
            {selectedQ.evidenceNote?.length ? (
              <>
                <h4>Заметка по доказательности</h4>
                {renderCompactList(selectedQ.evidenceNote)}
              </>
            ) : null}
          </div>

          <div className="q-answers-summary">
            <h4>Ответы</h4>
            {selectedQ.questions.map((q, i) => (
              <div key={i} className="q-answer-row">
                <span className="q-a-idx">{i + 1}</span>
                <span className="q-a-text">{q}</span>
                <span className="q-a-val" style={{ color: result.color }}>{selectedQ.options[answers[i]]}</span>
              </div>
            ))}
          </div>

          <div className="q-nav q-nav-wrap">
            <PremiumButton
              onClick={() => startQuestionnaire(selectedQ)}
              variant="secondary"
              size="md"
              shimmer={false}
            >
              Пройти заново
            </PremiumButton>

            <PremiumButton
              onClick={copyResultSummary}
              variant="secondary"
              size="md"
              shimmer={false}
            >
              {copied ? 'Скопировано' : 'Экспорт кратко'}
            </PremiumButton>

            <PremiumButton
              onClick={closeResults}
              variant="primary"
              size="md"
              shimmer={true}
            >
              ← К списку тестов
            </PremiumButton>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Questionnaire;
