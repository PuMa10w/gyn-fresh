import React, { useId, useMemo } from 'react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  resultCount?: number;
}

const SEARCH_SUGGESTIONS = [
  { label: 'Эндометриоз', query: 'эндометриоз N80', hint: 'тазовая боль, бесплодие' },
  { label: 'Миома матки', query: 'миома D25', hint: 'кровотечения, узлы' },
  { label: 'Рак шейки матки', query: 'рак шейки C53 ВПЧ', hint: 'онкология, HPV' },
  { label: 'Преэклампсия', query: 'преэклампсия O14 давление', hint: 'акушерство, гипертензия' },
  { label: 'Инфекции', query: 'инфекции хламидиоз гонорея', hint: 'ИППП, воспаление' },
  { label: 'Кровотечение', query: 'кровотечение N92 O46', hint: 'ургентно, гемостаз' },
];

const normalize = (value: string) => value.toLowerCase().replace(/ё/g, 'е');

const SearchBar = React.memo(function SearchBar({ searchTerm, setSearchTerm, resultCount }: SearchBarProps) {
  const inputId = useId();
  const suggestionId = useId();
  const trimmedTerm = searchTerm.trim();

  const suggestions = useMemo(() => {
    const normalizedTerm = normalize(trimmedTerm);
    if (normalizedTerm.length < 2) return SEARCH_SUGGESTIONS.slice(0, 3);

    return SEARCH_SUGGESTIONS.filter((suggestion) => {
      const haystack = normalize(`${suggestion.label} ${suggestion.query} ${suggestion.hint}`);
      return haystack.includes(normalizedTerm) || normalizedTerm.includes(normalize(suggestion.label));
    }).slice(0, 4);
  }, [trimmedTerm]);

  return (
    <motion.form
      className="search-container"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="visually-hidden" htmlFor={inputId}>
        Поиск по нозологиям, симптомам и кодам МКБ
      </label>
      <div className="search-input-wrapper">
        <input
          id={inputId}
          type="search"
          className="search-input"
          aria-label="Поиск по нозологиям, симптомам и кодам МКБ"
          aria-describedby={suggestionId}
          placeholder="Нозология, симптом, код МКБ..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          autoComplete="off"
          inputMode="search"
          enterKeyHint="search"
          spellCheck={false}
        />
        {searchTerm && (
          <motion.button
            type="button"
            className="search-clear-btn"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setSearchTerm('')}
            aria-label="Очистить поиск"
            title="Очистить поиск"
          >
            ×
          </motion.button>
        )}
        {typeof resultCount === 'number' && (
          <motion.span
            className="search-result-count"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            aria-label={`Найдено результатов: ${resultCount}`}
          >
            {resultCount}
          </motion.span>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="search-suggestions" id={suggestionId} aria-label="Быстрые подсказки поиска">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.query}
              type="button"
              className="search-suggestion-chip"
              onClick={() => setSearchTerm(suggestion.query)}
            >
              <span>{suggestion.label}</span>
              <small>{suggestion.hint}</small>
            </button>
          ))}
        </div>
      )}
    </motion.form>
  );
});

export default SearchBar;
