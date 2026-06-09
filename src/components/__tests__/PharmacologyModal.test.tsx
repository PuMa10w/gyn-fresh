import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PharmacologyModal from '../PharmacologyModal';

describe('PharmacologyModal', () => {
  it('renders and expands medication details', () => {
    render(<PharmacologyModal onClose={vi.fn()} />);

    fireEvent.click(screen.getAllByRole('button', { name: /открыть детали препарата: прогестерон/i })[0]);

    expect(screen.getByText(/progesterone/i)).toBeInTheDocument();
    expect(screen.getByText(/капсулы, гель, инъекции/i)).toBeInTheDocument();
  });

  it('shows detected interaction for selected drug combination', () => {
    render(<PharmacologyModal onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('tab', { name: /взаимодействия/i }));
    fireEvent.change(screen.getByLabelText(/первый препарат/i), { target: { value: 'nifedipine' } });
    fireEvent.change(screen.getByLabelText(/второй препарат/i), { target: { value: 'magnesium-sulfate' } });

    expect(screen.getByText(/проверка сочетания/i)).toBeInTheDocument();
    expect(screen.getAllByText(/усиление гипотензии/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/высокий риск/i).length).toBeGreaterThan(0);
  });

  it('filters interaction list by query', () => {
    render(<PharmacologyModal onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('tab', { name: /взаимодействия/i }));
    fireEvent.change(screen.getByPlaceholderText(/поиск взаимодействий/i), { target: { value: 'варфарин' } });

    expect(screen.getAllByText(/варфарин/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/блокаторы кальциевых каналов/i)).not.toBeInTheDocument();
  });

  it('shows only regimen entries in regimens tab', () => {
    render(<PharmacologyModal onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('tab', { name: /схемы/i }));

    expect(screen.getByText(/стимуляция овуляции при спкя/i)).toBeInTheDocument();
    expect(screen.queryByText(/^нитрофурантоин$/i)).not.toBeInTheDocument();
  });
});