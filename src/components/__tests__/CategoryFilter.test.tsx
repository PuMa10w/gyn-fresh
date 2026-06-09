import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryFilter, { categories } from '../CategoryFilter';
import type { CategoryId } from '../../types';

describe('CategoryFilter', () => {
  const mockProps = {
    activeCategory: 'all' as CategoryId,
    setActiveCategory: vi.fn(),
    categoryCounts: {
      oncology: 5,
      infection: 3,
      hormonal: 4,
      inflammatory: 2,
      pregnancy: 6,
    },
    visibleCategories: ['all', 'oncology', 'infection', 'hormonal', 'inflammatory', 'pregnancy'] as CategoryId[],
  };

  it('renders all category chips', () => {
    render(<CategoryFilter {...mockProps} />);
    
    categories.forEach((cat) => {
      expect(screen.getByText(cat.label)).toBeInTheDocument();
    });
  });

  it('highlights active category', () => {
    render(<CategoryFilter {...mockProps} activeCategory="oncology" />);
    
    const oncologyChip = screen.getByText('Онкология').closest('button');
    expect(oncologyChip).toHaveClass('active');
  });

  it('calls setActiveCategory when chip is clicked', () => {
    const setActiveCategory = vi.fn();
    render(<CategoryFilter {...mockProps} setActiveCategory={setActiveCategory} />);
    
    const oncologyChip = screen.getByText('Онкология');
    fireEvent.click(oncologyChip);
    
    expect(setActiveCategory).toHaveBeenCalledWith('oncology');
  });

  it('displays category counts', () => {
    render(<CategoryFilter {...mockProps} />);
    
    expect(screen.getByText('5')).toBeInTheDocument(); // oncology
    expect(screen.getByText('3')).toBeInTheDocument(); // infection
  });
});