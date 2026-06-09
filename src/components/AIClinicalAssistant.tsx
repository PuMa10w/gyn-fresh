import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { repairText } from '../utils/textRepair';

interface AIClinicalAssistantProps {
  diseaseName: string;
  symptoms: string[];
  treatment: Array<{ step: string; detail: string }>;
  onGenerate?: (text: string) => void;
}

type TemplateKey =
  | 'clinical-pearls'
  | 'differential'
  | 'workup-plan'
  | 'triage'
  | 'follow-up'
  | 'patient-instructions'
  | 'discharge-summary'
  | 'doctor-questions'
  | 'quick-consult';

const templateLabels: Record<TemplateKey, string> = {
  'clinical-pearls': 'Клинические акценты',
  differential: 'Дифдиагноз',
  'workup-plan': 'План обследования',
  triage: 'Triage',
  'follow-up': 'Follow-up',
  'patient-instructions': 'Памятка пациентке',
  'discharge-summary': 'Краткое заключение',
  'doctor-questions': 'Вопросы врачу',
  'quick-consult': 'Быстрая консультация',
};

export const AIClinicalAssistant: React.FC<AIClinicalAssistantProps> = ({
  diseaseName,
  symptoms,
  treatment,
  onGenerate,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('clinical-pearls');

  const cleanDiseaseName = repairText(diseaseName || 'клинической ситуации');
  const cleanSymptoms = symptoms.map(repairText).filter(Boolean);
  const cleanTreatment = treatment.map((entry) => ({ step: repairText(entry.step), detail: repairText(entry.detail) }));

  const templates = useMemo<Record<TemplateKey, string>>(() => {
    const symptomLead = cleanSymptoms.slice(0, 3).join(', ') || 'ключевые симптомы и факторы риска';
    const firstStep = cleanTreatment[0]?.step || 'диагностика и выбор тактики';
    const firstDetail = cleanTreatment[0]?.detail || 'сверка с актуальными клиническими рекомендациями';

    return {
      'clinical-pearls': `Клинические акценты по теме: ${cleanDiseaseName}\n\n1. Сначала оцените красные флаги, беременность, выраженность боли/кровотечения и гемодинамику.\n2. Приоритетные признаки: ${symptomLead}.\n3. Базовая тактика: ${firstStep}.\n4. Если источник или ситуация неочевидны, сверяйте решение с актуальными клиническими рекомендациями.`,
      differential: `Дифдиагноз: ${cleanDiseaseName}\n\n1. Уточните, какие симптомы действительно ведущие: ${symptomLead}.\n2. Исключите ургентные состояния: кровотечение, инфекция, перекрут/острая боль, осложнения беременности.\n3. Сопоставьте осмотр, УЗИ/лабораторию и динамику симптомов.\n4. Если признаки атипичны, формулируйте рабочий диагноз как предварительный и планируйте повторную оценку.`,
      'workup-plan': `План обследования: ${cleanDiseaseName}\n\n• Минимум сейчас: анамнез, осмотр, оценка беременности/лактации, красные флаги.\n• Инструментально: УЗИ или профильный метод визуализации по клинической задаче.\n• Лабораторно: только тесты, которые меняют тактику.\n• Контроль: заранее определить срок пересмотра и критерии эскалации.`,
      triage: `Triage: ${cleanDiseaseName}\n\nСрочно: нестабильность, сильная боль, кровотечение, септические признаки, патологическая беременность или ухудшение плода.\nВ ближайшее время: выраженные симптомы без нестабильности, неясный диагноз, высокий риск осложнений.\nПланово: стабильное состояние, понятный маршрут обследования и ясные критерии повторного обращения.`,
      'follow-up': `Follow-up: ${cleanDiseaseName}\n\n1. Зафиксируйте исходные симптомы и цель контроля.\n2. Назначьте срок пересмотра эффективности терапии.\n3. Укажите признаки, при которых пациентка обращается раньше.\n4. Если улучшения нет, пересмотрите диагноз, приверженность, противопоказания и необходимость направления.`,
      'patient-instructions': `Памятка пациентке: ${cleanDiseaseName}\n\n• Обратитесь к врачу при усилении боли, кровотечения, температуре, обмороке или ухудшении самочувствия.\n• Соблюдайте назначенную схему: ${firstDetail}.\n• Не прекращайте лечение и не меняйте дозировки без консультации.\n• Запланируйте контрольный осмотр в срок, указанный врачом.`,
      'discharge-summary': `Краткое клиническое заключение\n\nТема: ${cleanDiseaseName}\nЖалобы/ориентиры: ${symptomLead}\nПроведённая или планируемая тактика: ${cleanTreatment.map((entry) => entry.step).join(', ') || 'требует уточнения'}\nРекомендации: наблюдение у профильного специалиста, контроль эффективности терапии и повторная оценка при ухудшении.`,
      'doctor-questions': `Вопросы врачу по теме: ${cleanDiseaseName}\n\n• Какие признаки сегодня требуют срочной помощи?\n• Какие исследования действительно нужны и что изменит их результат?\n• Какая первая линия тактики и когда оценивать эффект?\n• Что делать при ухудшении, боли, кровотечении или побочных эффектах?\n• Нужно ли учитывать беременность, лактацию, репродуктивные планы или лекарства?`,
      'quick-consult': `Быстрая консультация: ${cleanDiseaseName}\n\nЧто уточнить сейчас: беременность, длительность симптомов, интенсивность боли/кровотечения, температура, лекарственные риски.\nПервая линия маршрутизации: ${firstStep}.\nКогда срочно: нестабильность, подозрение на острое состояние, выраженная анемия, септические признаки или быстрое ухудшение.`,
    };
  }, [cleanDiseaseName, cleanSymptoms, cleanTreatment]);

  const handleGenerate = (templateKey: TemplateKey) => {
    setIsGenerating(true);
    setActiveTemplate(templateKey);

    window.setTimeout(() => {
      const text = templates[templateKey];
      setGeneratedText(text);
      setIsGenerating(false);
      onGenerate?.(text);
    }, 320);
  };

  const handleCopy = async () => {
    if (!generatedText) return;
    await navigator.clipboard?.writeText(generatedText);
  };

  return (
    <motion.section
      className="clinical-template-assistant"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <header className="clinical-template-header">
        <span className="clinical-template-eyebrow">Клинический шаблон</span>
        <h3>Помощник формулировок</h3>
        <p>
          Быстро собирает аккуратный черновик для консультации, памятки или заключения. Текст требует врачебной
          проверки и сверки с актуальными рекомендациями.
        </p>
      </header>

      <div className="clinical-template-grid" aria-label="Шаблоны клинического текста">
        {(Object.keys(templateLabels) as TemplateKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className={`clinical-template-button ${activeTemplate === key ? 'is-active' : ''}`}
            onClick={() => handleGenerate(key)}
            disabled={isGenerating}
          >
            {templateLabels[key]}
          </button>
        ))}
      </div>

      {isGenerating ? (
        <div className="clinical-template-loading" role="status">
          <span className="clinical-template-spinner" />
          <p>Готовим клинический черновик...</p>
        </div>
      ) : null}

      {generatedText && !isGenerating ? (
        <motion.article
          className="clinical-template-output"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <pre>{generatedText}</pre>
          <button type="button" className="clinical-template-copy" onClick={handleCopy}>
            Копировать
          </button>
        </motion.article>
      ) : (
        <div className="clinical-template-empty">
          Выберите шаблон, чтобы получить структурированный текст для текущей клинической карточки.
        </div>
      )}

      <p className="clinical-template-disclaimer">
        Это не автономная AI-диагностика. Шаблон помогает оформить мысль, но клиническое решение остаётся за специалистом.
      </p>
    </motion.section>
  );
};
