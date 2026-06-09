import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('renders with placeholder', () => {
    render(<SearchBar searchTerm="" setSearchTerm={vi.fn()} />);
    
    expect(screen.getByPlaceholderText('Нозология, симптом, код МКБ...')).toBeInTheDocument();
  });

  it('calls setSearchTerm when input changes', () => {
    const setSearchTerm = vi.fn();
    render(<SearchBar searchTerm="" setSearchTerm={setSearchTerm} />);
    
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'эндометриоз' } });
    
    expect(setSearchTerm).toHaveBeenCalledWith('эндометриоз');
  });

  it('displays clear button when searchTerm is not empty', () => {
    render(<SearchBar searchTerm="тест" setSearchTerm={vi.fn()} />);
    
    expect(screen.getByRole('button', { name: /очистить/i })).toBeInTheDocument();
  });

  it('does not display clear button when searchTerm is empty', () => {
    render(<SearchBar searchTerm="" setSearchTerm={vi.fn()} />);
    
    expect(screen.queryByRole('button', { name: /очистить/i })).not.toBeInTheDocument();
  });

  it('clears search when clear button is clicked', () => {
    const setSearchTerm = vi.fn();
    render(<SearchBar searchTerm="тест" setSearchTerm={setSearchTerm} />);
    
    const clearButton = screen.getByRole('button', { name: /очистить/i });
    fireEvent.click(clearButton);
    
    expect(setSearchTerm).toHaveBeenCalledWith('');
  });

  it('displays result count when provided', () => {
    render(<SearchBar searchTerm="тест" setSearchTerm={vi.fn()} resultCount={5} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});