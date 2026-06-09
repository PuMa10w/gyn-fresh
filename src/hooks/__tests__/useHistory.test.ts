import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../useHistory';

describe('useHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with empty history', () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toEqual([]);
  });

  it('loads history from localStorage', () => {
    const storedHistory = [
      { id: 'endometriosis', name: 'Эндометриоз', icd: 'N80', timestamp: 1234567890 },
    ];
    localStorage.setItem('disease-history', JSON.stringify(storedHistory));

    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toEqual(storedHistory);
  });

  it('adds disease to history', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.addToHistory({ id: 'endometriosis', name: 'Эндометриоз', icd: 'N80' });
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].id).toBe('endometriosis');
  });

  it('moves existing item to top when re-added', () => {
    localStorage.setItem(
      'disease-history',
      JSON.stringify([
        { id: 'pcos', name: 'СПКЯ', icd: 'E28', timestamp: 1234567890 },
      ]),
    );

    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.addToHistory({ id: 'endometriosis', name: 'Эндометриоз', icd: 'N80' });
    });

    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[0].id).toBe('endometriosis');
    expect(result.current.history[1].id).toBe('pcos');
  });

  it('limits history to 10 items', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.addToHistory({ id: `disease-${i}`, name: `Disease ${i}`, icd: `N${i}` });
      }
    });

    expect(result.current.history).toHaveLength(10);
    expect(result.current.history[0].id).toBe('disease-14');
    expect(result.current.history[9].id).toBe('disease-5');
  });

  it('clears history', () => {
    localStorage.setItem(
      'disease-history',
      JSON.stringify([{ id: 'endometriosis', name: 'Эндометриоз', icd: 'N80', timestamp: 1234567890 }]),
    );

    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.history).toEqual([]);
  });

  it('handles invalid localStorage data', () => {
    localStorage.setItem('disease-history', 'invalid-json');

    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toEqual([]);
  });
});