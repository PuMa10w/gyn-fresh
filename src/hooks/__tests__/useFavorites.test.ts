import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../useFavorites';

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with empty favorites', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it('loads favorites from localStorage', () => {
    localStorage.setItem('disease-favorites', JSON.stringify(['endometriosis', 'pcos']));
    
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual(['endometriosis', 'pcos']);
  });

  it('adds favorite', () => {
    const { result } = renderHook(() => useFavorites());
    
    act(() => {
      result.current.addFavorite('endometriosis');
    });
    
    expect(result.current.favorites).toContain('endometriosis');
  });

  it('removes favorite', () => {
    localStorage.setItem('disease-favorites', JSON.stringify(['endometriosis', 'pcos']));
    
    const { result } = renderHook(() => useFavorites());
    
    act(() => {
      result.current.removeFavorite('endometriosis');
    });
    
    expect(result.current.favorites).not.toContain('endometriosis');
    expect(result.current.favorites).toContain('pcos');
  });

  it('toggles favorite on', () => {
    const { result } = renderHook(() => useFavorites());
    
    act(() => {
      result.current.toggleFavorite('endometriosis');
    });
    
    expect(result.current.favorites).toContain('endometriosis');
  });

  it('toggles favorite off', () => {
    localStorage.setItem('disease-favorites', JSON.stringify(['endometriosis']));
    
    const { result } = renderHook(() => useFavorites());
    
    act(() => {
      result.current.toggleFavorite('endometriosis');
    });
    
    expect(result.current.favorites).not.toContain('endometriosis');
  });

  it('checks if item is favorite', () => {
    localStorage.setItem('disease-favorites', JSON.stringify(['endometriosis']));
    
    const { result } = renderHook(() => useFavorites());
    
    expect(result.current.isFavorite('endometriosis')).toBe(true);
    expect(result.current.isFavorite('pcos')).toBe(false);
  });
});