import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(result.current).toBe('initial');
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    expect(result.current).toBe('updated');
  });

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    rerender({ value: 'second', delay: 500 });
    act(() => { vi.advanceTimersByTime(300); });
    
    rerender({ value: 'third', delay: 500 });
    act(() => { vi.advanceTimersByTime(300); });
    
    expect(result.current).toBe('first');
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    expect(result.current).toBe('third');
  });

  it('uses default delay of 300ms', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'test' }
    });

    rerender({ value: 'updated' });
    
    act(() => {
      vi.advanceTimersByTime(299);
    });
    
    expect(result.current).toBe('test');
    
    act(() => {
      vi.advanceTimersByTime(1);
    });
    
    expect(result.current).toBe('updated');
  });
});