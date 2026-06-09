import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DiseaseCard from '../DiseaseCard';
import type { Disease } from '../../types';

const mockDisease: Disease = {
  id: 'endometriosis',
  name: 'Эндометриоз',
  icd: 'N80',
  icdDetail: 'N80.0',
  subtitle: 'Гинекология',
  description: 'Доброкачественное разрастание ткани эндометрия.',
  icon: 'endometriosis',
  definition: 'Эндометриоз — это...',
  epidemiology: '10-15% женщин репродуктивного возраста',
  etiology: ['Ретроградная менструация', 'Генетическая предрасположенность'],
  symptoms: ['Хроническая тазовая боль', 'Дисменорея', 'Диспареуния'],
  diagnostics: {
    steps: ['УЗИ', 'МРТ', 'Лапароскопия'],
    markers: 'CA-125',
  },
  treatment: {
    conservative: ['КПК', 'Гестагены'],
    surgical: ['Лапароскопия'],
    guidelines: {
      eau: 'EAU guideline',
      acog: 'ACOG guideline',
      ranzcog: 'RANZCOG guideline',
      ru: 'Клин рекомендации',
    },
  },
};

describe('DiseaseCard', () => {
  const mockProps = {
    item: mockDisease,
    onClick: vi.fn(),
    index: 0,
    isFavorite: false,
    onToggleFavorite: vi.fn(),
  };

  it('renders disease name', () => {
    render(<DiseaseCard {...mockProps} />);
    
    expect(screen.getByText('Эндометриоз')).toBeInTheDocument();
  });

  it('renders ICD code', () => {
    render(<DiseaseCard {...mockProps} />);
    
    expect(screen.getByText('N80.0')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<DiseaseCard {...mockProps} />);
    
    expect(screen.getByText('Доброкачественное разрастание ткани эндометрия.')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<DiseaseCard {...mockProps} onClick={onClick} />);
    
    fireEvent.click(screen.getByText('Эндометриоз'));
    
    expect(onClick).toHaveBeenCalledWith(mockDisease);
  });

  it('calls onClick when Enter key is pressed', () => {
    const onClick = vi.fn();
    render(<DiseaseCard {...mockProps} onClick={onClick} />);
    
    const card = screen.getByLabelText(/открыть подробности/i);
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    
    expect(onClick).toHaveBeenCalledWith(mockDisease);
  });

  it('calls onToggleFavorite when favorite button is clicked', () => {
    const onToggleFavorite = vi.fn();
    render(<DiseaseCard {...mockProps} onToggleFavorite={onToggleFavorite} />);
    
    const favoriteBtn = screen.getByRole('button', { name: /добавить/i });
    fireEvent.click(favoriteBtn);
    
    expect(onToggleFavorite).toHaveBeenCalledWith('endometriosis');
  });

  it('shows filled heart when isFavorite is true', () => {
    render(<DiseaseCard {...mockProps} isFavorite={true} />);
    
    expect(screen.getByText('♥')).toBeInTheDocument();
  });

  it('shows empty heart when isFavorite is false', () => {
    render(<DiseaseCard {...mockProps} isFavorite={false} />);
    
    expect(screen.getByText('♡')).toBeInTheDocument();
  });
});