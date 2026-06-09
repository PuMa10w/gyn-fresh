import React from 'react';
import { motion } from 'framer-motion';
import type { CategoryId } from '../types';

const categories: Array<{ id: CategoryId; label: string; accent: string }> = [
  { id: 'all', label: 'Все разделы', accent: 'A' },
  { id: 'oncology', label: 'Онкология', accent: 'O' },
  { id: 'infection', label: 'Инфекции', accent: 'I' },
  { id: 'hormonal', label: 'Гормональные', accent: 'H' },
  { id: 'inflammatory', label: 'Воспалительные', accent: 'V' },
  { id: 'pregnancy', label: 'Беременность', accent: 'B' },
];

interface CategoryFilterProps {
  activeCategory: CategoryId;
  setActiveCategory: (value: CategoryId) => void;
  categoryCounts: Record<Exclude<CategoryId, 'all'>, number>;
  visibleCategories: CategoryId[];
}

const CategoryFilter = React.memo(function CategoryFilter({
  activeCategory,
  setActiveCategory,
  categoryCounts,
  visibleCategories,
}: CategoryFilterProps) {
  return (
    <motion.div
      className="category-filter"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.28, ease: 'easeOut' }}
    >
      <div className="category-chips" role="toolbar" aria-label="Фильтр по категориям">
        {categories
          .filter((category) => visibleCategories.includes(category.id))
          .map((category) => (
            <motion.button
              key={category.id}
              type="button"
              className={`category-chip ${activeCategory === category.id ? 'active' : ''}`}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCategory(category.id)}
              aria-pressed={activeCategory === category.id}
            >
              <span className="chip-icon" aria-hidden="true">
                {category.accent}
              </span>
              <span className="chip-label">{category.label}</span>
              {category.id !== 'all' && <span className="chip-count">{categoryCounts[category.id]}</span>}
            </motion.button>
          ))}
      </div>
    </motion.div>
  );
});

export { categories };
export default CategoryFilter;