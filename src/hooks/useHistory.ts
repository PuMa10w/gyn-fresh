import { useEffect, useState } from 'react';
import { repairText } from '../utils/textRepair';

type HistorySubtitle = 'Гинекология' | 'Акушерство';

interface HistoryDisease {
  id: string;
  name: string;
  icd: string;
  subtitle?: HistorySubtitle;
}

export interface HistoryItem extends HistoryDisease {
  timestamp: number;
}

const getLegacyId = (diseaseId: string) => diseaseId.split('__')[0];

const normalizeHistoryItem = (item: HistoryItem): HistoryItem => ({
  ...item,
  id: repairText(item.id),
  name: repairText(item.name),
  icd: repairText(item.icd),
  subtitle: item.subtitle ? (repairText(item.subtitle) as HistorySubtitle) : undefined,
});

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('disease-history') || '[]') as HistoryItem[];
      return Array.isArray(parsed) ? parsed.map(normalizeHistoryItem).slice(0, 10) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('disease-history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (disease: HistoryDisease) => {
    setHistory((prev) => {
      const normalizedDisease = normalizeHistoryItem({ ...disease, timestamp: Date.now() });
      const legacyId = getLegacyId(normalizedDisease.id);
      const filtered = prev.filter((item) => item.id !== normalizedDisease.id && item.id !== legacyId);
      const updated = [
        normalizedDisease,
        ...filtered,
      ].slice(0, 10);
      return updated;
    });
  };

  const clearHistory = () => setHistory([]);

  return { history, addToHistory, clearHistory };
}
