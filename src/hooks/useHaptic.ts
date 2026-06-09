import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification';

export function useHaptic() {
  const trigger = useCallback((type: HapticType = 'medium') => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    const patterns: Record<HapticType, number | number[]> = {
      light: 10,
      medium: 25,
      heavy: 40,
      selection: 5,
      impact: [0, 15, 15, 15],
      notification: [0, 20, 40],
    };

    navigator.vibrate(patterns[type]);
  }, []);

  return { trigger };
}