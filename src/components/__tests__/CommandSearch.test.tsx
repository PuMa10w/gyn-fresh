import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CommandSearch from '../CommandSearch';

describe('CommandSearch', () => {
  it('shows guided recovery actions when no command matches', () => {
    const onCommand = vi.fn();
    render(<CommandSearch onCommand={onCommand} />);

    fireEvent.change(screen.getByRole('searchbox', { name: /глобальный поиск gyn/i }), {
      target: { value: 'редкий клинический запрос' },
    });

    expect(screen.getByText('Продолжить клинический поиск?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Искать в каталоге' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Фарма' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Шкалы' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Искать в каталоге' }));

    expect(onCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'free-search',
        query: 'редкий клинический запрос',
        route: 'gynecology',
      }),
    );
  });

  it('routes matched clinical commands directly', () => {
    const onCommand = vi.fn();
    render(<CommandSearch onCommand={onCommand} />);

    fireEvent.change(screen.getByRole('searchbox', { name: /глобальный поиск gyn/i }), {
      target: { value: 'O14' },
    });
    fireEvent.click(screen.getByRole('button', { name: /преэклампсия/i }));

    expect(onCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'preeclampsia',
        route: 'obstetrics',
      }),
    );
  });
});
