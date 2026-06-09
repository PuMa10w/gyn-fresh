import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumButton } from './PremiumButton';
import type { Disease } from '../types';
import { repairText } from '../utils/textRepair';

interface PatientMemoProps {
  disease: Disease | null;
  className?: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const buildTreatmentSteps = (disease: Disease) => [
  ...(disease.treatment.firstLine ?? disease.treatment.conservative ?? []).map((detail) => ({
    step: 'Первая линия',
    detail,
  })),
  ...(disease.treatment.secondLine ?? []).map((detail) => ({ step: 'Вторая линия', detail })),
  ...(disease.treatment.proceduralOrSurgical ?? disease.treatment.surgical ?? []).map((detail) => ({
    step: 'Процедуры/хирургия',
    detail,
  })),
  ...(disease.treatment.inpatientManagement ?? []).map((detail) => ({ step: 'Стационар', detail })),
];

export const PatientMemo: React.FC<PatientMemoProps> = ({ disease, className = '' }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const memo = useMemo(() => {
    if (!disease) return null;

    const name = repairText(disease.name);
    const icd = repairText(disease.icdDetail ?? disease.icd);
    const definition = repairText(disease.patientExplanation?.plainLanguageSummary ?? disease.definition);
    const symptoms = (disease.symptoms ?? []).map(repairText).filter(Boolean).slice(0, 8);
    const counseling = (disease.patientCounseling ?? disease.patientExplanation?.whatToWatch ?? [])
      .map(repairText)
      .filter(Boolean)
      .slice(0, 8);
    const urgent = (
      disease.patientExplanation?.whenToSeekCare ??
      disease.clinicalSummary?.whenToEscalate ??
      disease.clinicalSummary?.redFlags ??
      []
    )
      .map(repairText)
      .filter(Boolean)
      .slice(0, 8);
    const treatmentSteps = buildTreatmentSteps(disease)
      .map((entry) => ({ step: repairText(entry.step), detail: repairText(entry.detail) }))
      .filter((entry) => entry.detail)
      .slice(0, 5);

    return {
      name,
      icd,
      definition,
      symptoms,
      counseling,
      urgent,
      treatmentSteps,
    };
  }, [disease]);

  if (!memo) {
    return (
      <section className={`patient-memo clinical-tool-surface ${className}`}>
        <header className="clinical-tool-header">
          <span className="clinical-tool-eyebrow">Памятка пациентке</span>
          <h3>Выберите карточку</h3>
          <p>После открытия нозологии здесь появится аккуратная памятка для печати, PDF или копирования.</p>
        </header>
      </section>
    );
  }

  const textMemo = [
    `ПАМЯТКА ПАЦИЕНТКЕ`,
    `${memo.name} (${memo.icd})`,
    '',
    'Что это:',
    memo.definition,
    '',
    memo.symptoms.length ? `На что обратить внимание:\n${memo.symptoms.map((item) => `• ${item}`).join('\n')}` : '',
    memo.treatmentSteps.length
      ? `Тактика, которую обсуждают с врачом:\n${memo.treatmentSteps.map((item) => `• ${item.step}: ${item.detail}`).join('\n')}`
      : '',
    memo.urgent.length ? `Когда обратиться срочно:\n${memo.urgent.map((item) => `• ${item}`).join('\n')}` : '',
    memo.counseling.length ? `Важные рекомендации:\n${memo.counseling.map((item) => `• ${item}`).join('\n')}` : '',
    '',
    'Важно: памятка не заменяет консультацию врача и актуальные клинические рекомендации.',
  ]
    .filter(Boolean)
    .join('\n\n');

  const handlePrint = () => {
    setIsGenerating(true);
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      window.alert('Разрешите всплывающие окна для печати памятки.');
      setIsGenerating(false);
      return;
    }

    const list = (items: string[]) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    const treatment = memo.treatmentSteps
      .map(
        (item) =>
          `<article class="card"><strong>${escapeHtml(item.step)}</strong><p>${escapeHtml(item.detail)}</p></article>`,
      )
      .join('');

    printWindow.document.write(`
      <!doctype html>
      <html lang="ru">
        <head>
          <meta charset="utf-8" />
          <title>Памятка пациентке: ${escapeHtml(memo.name)}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #2b2023; background: #fffaf5; margin: 0; padding: 28px; line-height: 1.58; }
            main { max-width: 820px; margin: 0 auto; }
            header { background: linear-gradient(135deg, #f4c4b5, #d996a2); border-radius: 24px; padding: 28px; margin-bottom: 20px; }
            h1 { margin: 0 0 8px; font-size: 28px; }
            section { background: #fff; border: 1px solid rgba(185,120,134,.22); border-radius: 18px; padding: 18px; margin: 14px 0; }
            h2 { margin: 0 0 10px; font-size: 18px; color: #8d5260; }
            ul { margin: 0; padding-left: 22px; }
            .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
            .card { background: #fff6ef; border-radius: 14px; padding: 14px; border: 1px solid rgba(185,120,134,.18); }
            .warning { border-left: 5px solid #bd4053; background: #fff3f3; }
            footer { color: #67525a; font-size: 12px; margin-top: 24px; }
            button { min-height: 44px; border: 0; border-radius: 999px; padding: 0 18px; background: #2b2023; color: #fffaf5; font-weight: 700; }
            @media print { button { display: none; } body { background: #fff; } }
          </style>
        </head>
        <body>
          <main>
            <header>
              <h1>Памятка пациентке</h1>
              <div>МКБ-10: ${escapeHtml(memo.icd)} · ${escapeHtml(memo.name)}</div>
            </header>
            <section><h2>Что это</h2><p>${escapeHtml(memo.definition)}</p></section>
            ${memo.symptoms.length ? `<section><h2>На что обратить внимание</h2><ul>${list(memo.symptoms)}</ul></section>` : ''}
            ${memo.treatmentSteps.length ? `<section><h2>Тактика, которую обсуждают с врачом</h2><div class="grid">${treatment}</div></section>` : ''}
            ${memo.urgent.length ? `<section class="warning"><h2>Когда обратиться срочно</h2><ul>${list(memo.urgent)}</ul></section>` : ''}
            ${memo.counseling.length ? `<section><h2>Важные рекомендации</h2><ul>${list(memo.counseling)}</ul></section>` : ''}
            <footer>Памятка не заменяет консультацию врача. Дата формирования: ${new Date().toLocaleDateString('ru-RU')}.</footer>
            <p><button onclick="window.print()">Печать / PDF</button></p>
          </main>
        </body>
      </html>
    `);
    printWindow.document.close();
    window.setTimeout(() => {
      printWindow.print();
      setIsGenerating(false);
    }, 600);
  };

  const handleCopyText = async () => {
    await navigator.clipboard?.writeText(textMemo);
  };

  return (
    <motion.section
      className={`patient-memo clinical-tool-surface ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <header className="clinical-tool-header">
        <span className="clinical-tool-eyebrow">Памятка пациентке</span>
        <h3>Краткая памятка: {memo.name}</h3>
        <p>
          Формирует спокойное объяснение для пациентки: что это значит, когда обращаться срочно и что обсудить с врачом.
        </p>
      </header>

      <div className="patient-memo-actions">
        <PremiumButton onClick={handlePrint} variant="primary" shimmer={isGenerating} disabled={isGenerating}>
          {isGenerating ? 'Готовим PDF...' : 'Печать / PDF'}
        </PremiumButton>
        <PremiumButton onClick={handleCopyText} variant="secondary" size="sm" shimmer={false}>
          Копировать текст
        </PremiumButton>
      </div>

      <div className="patient-memo-preview">
        <article>
          <strong>Что это</strong>
          <p>{memo.definition}</p>
        </article>
        {memo.urgent.length ? (
          <article className="patient-memo-alert">
            <strong>Когда срочно</strong>
            <ul>{memo.urgent.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ) : null}
        {memo.counseling.length ? (
          <article>
            <strong>Важные рекомендации</strong>
            <ul>{memo.counseling.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ) : null}
      </div>

      <p className="clinical-tool-note">
        Памятка информационная: итоговую тактику, дозировки и сроки контроля определяет специалист.
      </p>
    </motion.section>
  );
};
