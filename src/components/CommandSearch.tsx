import React, { useEffect, useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { CategoryId, TabType } from '../types';

export type WorkbenchCommand = {
  id: string;
  label: string;
  description: string;
  query: string;
  route: TabType | 'pharmacology' | 'questionnaires';
  category?: CategoryId;
  badge: string;
  keywords: string[];
};

const COMMANDS: WorkbenchCommand[] = [
  {
    id: 'endo',
    label: 'Эндометриоз',
    description: 'Тазовая боль, бесплодие, УЗИ/МРТ и маршрутизация лечения боли',
    query: 'эндометриоз N80',
    route: 'gynecology',
    category: 'all',
    badge: 'Нозология',
    keywords: ['эндометриоз', 'n80', 'тазовая боль', 'узи', 'мрт', 'бесплодие'],
  },
  {
    id: 'pcos',
    label: 'СПКЯ',
    description: 'Ановуляция, гиперандрогения, критерии Роттердама и метаболический риск',
    query: 'СПКЯ E28.2',
    route: 'gynecology',
    category: 'hormonal',
    badge: 'Эндокринология',
    keywords: ['спкя', 'pcos', 'e28.2', 'ановуляция', 'роттердам', 'гиперандрогения'],
  },
  {
    id: 'cervical-cancer',
    label: 'Рак шейки матки',
    description: 'C53, ВПЧ, CIN/HSIL и маршрутизация к онкогинекологу',
    query: 'рак шейки C53 ВПЧ',
    route: 'gynecology',
    category: 'oncology',
    badge: 'Онкориск',
    keywords: ['рак шейки', 'c53', 'впч', 'hpv', 'cin', 'hsil', 'онкология'],
  },
  {
    id: 'bleeding',
    label: 'Кровотечение',
    description: 'АМК, N92, O46, ургентная оценка и гемостаз',
    query: 'кровотечение N92 O46',
    route: 'gynecology',
    category: 'all',
    badge: 'Triage',
    keywords: ['кровотечение', 'амк', 'n92', 'o46', 'ургентно', 'гемостаз'],
  },
  {
    id: 'preeclampsia',
    label: 'Преэклампсия',
    description: 'O14, давление, протеинурия, магний и сроки родоразрешения',
    query: 'преэклампсия O14 давление',
    route: 'obstetrics',
    category: 'pregnancy',
    badge: 'Акушерство',
    keywords: ['преэклампсия', 'o14', 'давление', 'гипертензия', 'магний', 'hellp'],
  },
  {
    id: 'ultrasound',
    label: 'УЗИ и заключение',
    description: 'Протокол, находки, чек-лист заключения и показания к МРТ/КТ',
    query: 'УЗИ протокол находки заключение',
    route: 'gynecology',
    category: 'all',
    badge: 'Визуализация',
    keywords: ['узи', 'эхография', 'допплер', 'мрт', 'кт', 'заключение'],
  },
  {
    id: 'infection',
    label: 'ИППП и воспаление',
    description: 'Хламидиоз, гонорея, ВЗОМТ, вагинит и партнёр-менеджмент',
    query: 'инфекции хламидиоз гонорея ВЗОМТ',
    route: 'gynecology',
    category: 'infection',
    badge: 'Инфекции',
    keywords: ['инфекции', 'иппп', 'хламидиоз', 'гонорея', 'взомт', 'вагинит'],
  },
  {
    id: 'pharma',
    label: 'Фармакология',
    description: 'Сценарии, first-line, беременность, лактация, взаимодействия и схемы',
    query: 'фармакология препараты схемы',
    route: 'pharmacology',
    badge: 'Препараты',
    keywords: ['фарма', 'фармакология', 'препарат', 'лекарство', 'схема', 'взаимодействия'],
  },
  {
    id: 'questionnaires',
    label: 'Опросники',
    description: 'PHQ-9, EPDS, боль, ПМС, качество жизни, результат и next steps',
    query: 'опросники шкалы PHQ-9 EPDS',
    route: 'questionnaires',
    badge: 'Шкалы',
    keywords: ['опросники', 'шкалы', 'phq', 'epds', 'депрессия', 'боль', 'пмс'],
  },
  {
    id: 'contraception',
    label: 'Контрацепция',
    description: 'КОК, ВМС, экстренная контрацепция, риски и противопоказания',
    query: 'контрацепция КОК ВМС',
    route: 'gynecology',
    category: 'hormonal',
    badge: 'Сценарий',
    keywords: ['контрацепция', 'кок', 'вмс', 'левоноргестрел', 'дроспиренон'],
  },
  {
    id: 'gestational-diabetes',
    label: 'Гестационный диабет',
    description: 'O24, скрининг, питание, инсулин, мониторинг и роды',
    query: 'гестационный диабет O24',
    route: 'obstetrics',
    category: 'pregnancy',
    badge: 'Беременность',
    keywords: ['диабет', 'o24', 'глюкоза', 'инсулин', 'гсд'],
  },
  {
    id: 'postpartum',
    label: 'Послеродовый период',
    description: 'Кровотечение, инфекция, лактация, депрессия и follow-up',
    query: 'послеродовый период кровотечение лактация',
    route: 'obstetrics',
    category: 'pregnancy',
    badge: 'Follow-up',
    keywords: ['послеродов', 'лактация', 'мастит', 'epds', 'кровотечение'],
  },
];

const normalize = (value: string) => value.toLowerCase().replace(/ё/g, 'е');

const freeSearchCommand = (query: string): WorkbenchCommand => ({
  id: 'free-search',
  label: query || 'Поиск',
  description: 'Поиск по каталогу гинекологии',
  query,
  route: 'gynecology',
  category: 'all',
  badge: 'Поиск',
  keywords: [],
});

const pharmaCommand = COMMANDS.find((command) => command.id === 'pharma') ?? {
  id: 'pharma',
  label: 'Фармакология',
  description: 'Сценарии, first-line, беременность, лактация, взаимодействия и схемы',
  query: 'фармакология препараты схемы',
  route: 'pharmacology' as const,
  badge: 'Препараты',
  keywords: ['фарма', 'препарат', 'лекарство'],
};

const questionnairesCommand = COMMANDS.find((command) => command.id === 'questionnaires') ?? {
  id: 'questionnaires',
  label: 'Опросники',
  description: 'Клинические шкалы, результат и next steps',
  query: 'опросники шкалы',
  route: 'questionnaires' as const,
  badge: 'Шкалы',
  keywords: ['опросники', 'шкалы'],
};

interface CommandSearchProps {
  onCommand: (command: WorkbenchCommand) => void;
}

export const CommandSearch: React.FC<CommandSearchProps> = ({ onCommand }) => {
  const inputId = useId();
  const hintId = useId();
  const [query, setQuery] = useState(() => {
    try {
      return sessionStorage.getItem('gyn-command-search') ?? '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      const trimmed = query.trim();
      if (!trimmed) {
        sessionStorage.removeItem('gyn-command-search');
        return;
      }
      if (trimmed.length <= 80) sessionStorage.setItem('gyn-command-search', trimmed);
    } catch {
      // Ignore storage restrictions in private/PWA contexts.
    }
  }, [query]);

  const suggestions = useMemo(() => {
    const normalized = normalize(query.trim());
    if (normalized.length < 2) return COMMANDS.slice(0, 6);

    return COMMANDS
      .map((command) => {
        const haystack = normalize([command.label, command.description, command.query, ...command.keywords].join(' '));
        const score = haystack.includes(normalized) ? 2 : normalized.split(/\s+/).filter((part) => haystack.includes(part)).length;
        return { command, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.command)
      .slice(0, 6);
  }, [query]);

  const trimmedQuery = query.trim();
  const hasQuery = normalize(trimmedQuery).length >= 2;
  const hasNoSuggestions = hasQuery && suggestions.length === 0;
  const fallbackSearchCommand = useMemo(() => freeSearchCommand(trimmedQuery), [trimmedQuery]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const selected = suggestions[0] ?? fallbackSearchCommand;
    onCommand(selected);
  };

  return (
    <motion.section
      className="workbench-command"
      aria-labelledby={`${inputId}-title`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="workbench-command-head">
        <span className="workbench-eyebrow">Быстрый приём</span>
        <h3 id={`${inputId}-title`}>Клинический поиск</h3>
        <p id={hintId}>Один вход для нозологий, МКБ, УЗИ, препаратов и клинических шкал.</p>
      </div>

      <form className="workbench-command-form" role="search" onSubmit={submit}>
        <label className="visually-hidden" htmlFor={inputId}>
          Глобальный поиск GYN
        </label>
        <input
          id={inputId}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-describedby={hintId}
          aria-label="Глобальный поиск GYN"
          className="workbench-command-input"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          placeholder="Например: O14, эндометриоз, УЗИ, фарма, EPDS..."
        />
        <button type="submit" className="workbench-command-submit">
          Найти
        </button>
      </form>

      <div className="workbench-command-results" aria-label="Быстрые клинические маршруты" aria-live="polite">
        {suggestions.map((command) => (
          <button key={command.id} type="button" className="workbench-command-card" onClick={() => onCommand(command)}>
            <span className="workbench-command-badge">{command.badge}</span>
            <strong>{command.label}</strong>
            <small>{command.description}</small>
          </button>
        ))}
        {hasNoSuggestions && (
          <div className="workbench-command-empty" role="status">
            <span className="workbench-command-badge">Нет точного совпадения</span>
            <h4>Продолжить клинический поиск?</h4>
            <p>Попробуйте код МКБ, симптом, латинское название или перейдите сразу в фарму/шкалы.</p>
            <div className="workbench-command-empty-actions">
              <button type="button" onClick={() => onCommand(fallbackSearchCommand)}>
                Искать в каталоге
              </button>
              <button type="button" onClick={() => onCommand(pharmaCommand)}>
                Фарма
              </button>
              <button type="button" onClick={() => onCommand(questionnairesCommand)}>
                Шкалы
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default CommandSearch;
