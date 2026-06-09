import { useEffect, useState } from 'react';
import { repairText } from '../utils/textRepair';

type FavoriteId = string;

const getLegacyId = (diseaseId: string) => diseaseId.split('__')[0];
const normalizeFavoriteId = (value: unknown): FavoriteId => repairText(String(value ?? '')).trim();

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteId[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('disease-favorites') || '[]') as unknown[];
      const normalized = Array.isArray(parsed)
        ? [...new Set(parsed.map(normalizeFavoriteId).filter(Boolean))]
        : [];
      return normalized;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('disease-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (diseaseId: FavoriteId) => {
    if (!favorites.includes(diseaseId) && !favorites.includes(getLegacyId(diseaseId))) {
      setFavorites((prev) => [...prev, diseaseId]);
    }
  };

  const removeFavorite = (diseaseId: FavoriteId) => {
    const legacyId = getLegacyId(diseaseId);
    setFavorites((prev) => prev.filter((id) => id !== diseaseId && id !== legacyId));
  };

  const toggleFavorite = (diseaseId: FavoriteId) => {
    if (favorites.includes(diseaseId)) {
      removeFavorite(diseaseId);
    } else {
      addFavorite(diseaseId);
    }
  };

  const isFavorite = (diseaseId: FavoriteId) => favorites.includes(diseaseId) || favorites.includes(getLegacyId(diseaseId));

  return { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite };
}
