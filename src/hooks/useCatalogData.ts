import { useEffect, useMemo, useState } from 'react';
import { loadGynData } from '../data/loadGynData';
import { loadObsData } from '../data/loadObsData';
import {
  categorizeDiseases,
  filterDiseases,
  getCategoryCounts,
  getVisibleCategories,
} from '../utils/diseaseCatalog';
import type { CategoryId, Disease, TabType } from '../types';

interface UseCatalogDataOptions {
  activeTab: TabType;
  activeCategory: CategoryId;
  favoriteIds: Set<string>;
  historyIds: Set<string>;
  normalizedSearch: string;
  showFavorites: boolean;
  showHistory: boolean;
  onInvalidCategory: () => void;
}

type SectionErrorState = {
  gynecology: string | null;
  obstetrics: string | null;
};

function getSectionData(activeTab: TabType, gynecologyData: Disease[] | null, obstetricsData: Disease[] | null) {
  if (activeTab === 'home') {
    return {
      currentData: [],
      isDataLoading: false,
    };
  }

  if (activeTab === 'gynecology') {
    return {
      currentData: gynecologyData ?? [],
      isDataLoading: gynecologyData === null,
    };
  }

  return {
    currentData: obstetricsData ?? [],
    isDataLoading: obstetricsData === null,
  };
}

export function useCatalogData({
  activeTab,
  activeCategory,
  favoriteIds,
  historyIds,
  normalizedSearch,
  showFavorites,
  showHistory,
  onInvalidCategory,
}: UseCatalogDataOptions) {
  const [gynecologyData, setGynecologyData] = useState<Disease[] | null>(null);
  const [obstetricsData, setObstetricsData] = useState<Disease[] | null>(null);
  const [errors, setErrors] = useState<SectionErrorState>({ gynecology: null, obstetrics: null });
  const [reloadKey, setReloadKey] = useState(0);

  const { currentData, isDataLoading } = getSectionData(activeTab, gynecologyData, obstetricsData);
  const visibleCategories = activeTab === 'home' ? (['all'] as CategoryId[]) : getVisibleCategories(activeTab);
  const error = activeTab === 'gynecology' ? errors.gynecology : activeTab === 'obstetrics' ? errors.obstetrics : null;

  const categorizedData = useMemo(() => categorizeDiseases(currentData), [currentData]);
  const categoryCounts = useMemo(() => getCategoryCounts(categorizedData), [categorizedData]);

  const filteredData = useMemo(
    () =>
      filterDiseases({
        activeCategory,
        categorizedData,
        historyIds,
        favoriteIds,
        normalizedSearch,
        showFavorites,
        showHistory,
      }),
    [activeCategory, categorizedData, favoriteIds, historyIds, normalizedSearch, showFavorites, showHistory],
  );

  useEffect(() => {
    if (!visibleCategories.includes(activeCategory)) {
      onInvalidCategory();
    }
  }, [activeCategory, onInvalidCategory, visibleCategories]);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      if (activeTab === 'home') {
        return;
      }

      try {
        if (activeTab === 'gynecology') {
          if (gynecologyData !== null) {
            return;
          }

          const data = await loadGynData();
          if (!isCancelled) {
            setErrors((prev) => ({ ...prev, gynecology: null }));
            setGynecologyData(data);
          }
          return;
        }

        if (obstetricsData !== null) {
          return;
        }

        const data = await loadObsData();
        if (!isCancelled) {
          setErrors((prev) => ({ ...prev, obstetrics: null }));
          setObstetricsData(data);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrors((prev) => ({
            ...prev,
            [activeTab]: 'Не удалось загрузить материалы раздела. Проверьте соединение и попробуйте еще раз.',
          }));
        }

        console.error('[useCatalogData] Error loading data:', error);
      }
    };

    void loadData();

    return () => {
      isCancelled = true;
    };
  }, [activeTab, gynecologyData, obstetricsData, reloadKey]);

  const retry = () => {
    if (activeTab === 'gynecology') {
      setGynecologyData(null);
      setErrors((prev) => ({ ...prev, gynecology: null }));
    }

    if (activeTab === 'obstetrics') {
      setObstetricsData(null);
      setErrors((prev) => ({ ...prev, obstetrics: null }));
    }

    setReloadKey((prev) => prev + 1);
  };

  return {
    isDataLoading,
    visibleCategories,
    categoryCounts,
    filteredData,
    error,
    retry,
  };
}