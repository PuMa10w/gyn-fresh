import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Questionnaire from '../Questionnaire';

describe('Questionnaire', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows empty history state', () => {
    render(<Questionnaire onClose={vi.fn()} />);

    expect(screen.getByText(/история пока пуста/i)).toBeInTheDocument();
  });

  it('can clear saved history', () => {
    localStorage.setItem(
      'questionnaire-history',
      JSON.stringify([
        {
          id: 'phq-9',
          name: 'PHQ-9',
          fullName: 'Patient Health Questionnaire-9',
          date: '01.01.2026',
          score: 10,
          level: 'Умеренная депрессия',
          severity: 'moderate',
          color: '#e67e22',
        },
      ]),
    );

    render(<Questionnaire onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /очистить историю/i }));

    expect(screen.getByText(/история пока пуста/i)).toBeInTheDocument();
    expect(localStorage.getItem('questionnaire-history')).toBeNull();
  });

  it('completes questionnaire and shows result screen', async () => {
    render(<Questionnaire onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /открыть опросник: phq-9/i }));

    for (let step = 0; step < 9; step += 1) {
      fireEvent.click(screen.getByRole('radio', { name: /0 — совсем нет/i }));
      fireEvent.click(screen.getByRole('button', { name: step === 8 ? /получить результат/i : /далее/i }));
    }

    await waitFor(() => {
      expect(screen.getByText(/результат/i)).toBeInTheDocument();
      expect(screen.getByText(/минимальная депрессия/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('questionnaire-history')).toContain('PHQ-9');
  });
});