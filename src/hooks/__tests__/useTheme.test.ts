import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with light theme by default', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('loads theme from localStorage', () => {
    localStorage.setItem('app-theme', 'dark');
    
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('toggles theme from light to dark', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('dark');
  });

  it('toggles theme from dark to light', () => {
    localStorage.setItem('app-theme', 'dark');
    
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('light');
  });

  it('ignores invalid localStorage values', () => {
    localStorage.setItem('app-theme', 'invalid');
    
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });
});