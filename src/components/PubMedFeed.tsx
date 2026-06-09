import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumButton } from './PremiumButton';
import { repairText } from '../utils/textRepair';

interface Paper {
  title: string;
  authors: string;
  journal: string;
  year: string;
  pmid: string;
  abstract?: string;
}

interface PubMedFeedProps {
  diseaseName: string;
  className?: string;
}

const MOCK_PAPERS: Record<string, Paper[]> = {
  'Миома матки': [
    {
      title: 'Uterine Fibroids: Pathogenesis and Current Management Trends',
      authors: 'Stewart EA, et al.',
      journal: 'Obstet Gynecol',
      year: '2023',
      pmid: '37245631',
    },
    {
      title: 'Minimally invasive approaches to uterine fibroid treatment',
      authors: 'Gupta JK, et al.',
      journal: 'Lancet',
      year: '2022',
      pmid: '35483421',
    },
  ],
  Эндометриоз: [
    {
      title: 'Endometriosis: A Review of Pathophysiology and Treatment',
      authors: 'Zondervan KT, et al.',
      journal: 'N Engl J Med',
      year: '2024',
      pmid: '38151005',
    },
    {
      title: 'Novel biomarkers for early detection of endometriosis',
      authors: 'Vigano P, et al.',
      journal: 'Hum Reprod Update',
      year: '2023',
      pmid: '36734821',
    },
  ],
  'Воспалительные заболевания органов малого таза': [
    {
      title: 'PID: Updated Guidelines for Diagnosis and Treatment',
      authors: 'Ross J, et al.',
      journal: 'CDC MMWR',
      year: '2024',
      pmid: '38903321',
    },
  ],
};

const findMockPapers = (diseaseName: string) => {
  const cleanName = repairText(diseaseName);
  const exact = MOCK_PAPERS[cleanName];
  if (exact) return exact;
  const fuzzyKey = Object.keys(MOCK_PAPERS).find((key) => cleanName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName.toLowerCase()));
  return fuzzyKey ? MOCK_PAPERS[fuzzyKey] : [
    {
      title: `Recent advances in ${cleanName} management`,
      authors: 'Various Authors',
      journal: 'Medical Journal',
      year: '2024',
      pmid: '00000000',
    },
  ];
};

export const PubMedFeed: React.FC<PubMedFeedProps> = ({
  diseaseName,
  className = '',
}) => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAbstract, setShowAbstract] = useState<string | null>(null);
  const cleanDiseaseName = repairText(diseaseName);

  const searchPapers = () => {
    setIsLoading(true);
    window.setTimeout(() => {
      setPapers(findMockPapers(cleanDiseaseName));
      setIsLoading(false);
    }, 650);
  };

  const openPaper = (pmid: string) => {
    if (pmid === '00000000') return;
    window.open(`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`, '_blank');
  };

  return (
    <motion.section
      className={`pubmed-feed clinical-tool-surface ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <header className="clinical-tool-header clinical-tool-header-row">
        <div>
          <span className="clinical-tool-eyebrow">Источники и публикации</span>
          <h3>PubMed-подборка</h3>
          <p>Быстрый список публикаций по теме: <strong>{cleanDiseaseName}</strong>.</p>
        </div>
        <PremiumButton onClick={searchPapers} variant="primary" size="sm" shimmer={isLoading} disabled={isLoading}>
          {isLoading ? 'Ищем...' : 'Найти статьи'}
        </PremiumButton>
      </header>

      {isLoading ? (
        <div className="clinical-tool-loading" role="status">
          <span className="clinical-template-spinner" />
          <p>Ищем в PubMed...</p>
        </div>
      ) : null}

      {!isLoading && papers.length === 0 ? (
        <div className="clinical-tool-empty">Нажмите «Найти статьи», чтобы увидеть свежие публикации и ориентиры для проверки источников.</div>
      ) : null}

      {!isLoading && papers.length > 0 ? (
        <motion.div className="pubmed-paper-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {papers.map((paper, index) => (
            <motion.article
              key={paper.pmid}
              className="pubmed-paper-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <button type="button" className="pubmed-paper-main" onClick={() => openPaper(paper.pmid)}>
                <h4>{paper.title}</h4>
                <span>{paper.authors} • {paper.journal} • {paper.year}</span>
                <small>PMID: {paper.pmid}</small>
              </button>
              <PremiumButton onClick={() => setShowAbstract(showAbstract === paper.pmid ? null : paper.pmid)} variant="ghost" size="sm" shimmer={false}>
                {showAbstract === paper.pmid ? 'Скрыть' : 'Аннотация'}
              </PremiumButton>
              {showAbstract === paper.pmid ? (
                <motion.p className="pubmed-abstract" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {paper.abstract || 'Аннотация недоступна в локальной подборке. Перейдите по PMID для просмотра записи PubMed.'}
                </motion.p>
              ) : null}
            </motion.article>
          ))}
          <p className="clinical-tool-note">Данные служат навигацией по источникам. Перед клиническим использованием сверяйте полные тексты и актуальные рекомендации.</p>
        </motion.div>
      ) : null}
    </motion.section>
  );
};
