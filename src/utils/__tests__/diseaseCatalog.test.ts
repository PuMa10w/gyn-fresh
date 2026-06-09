import { describe, expect, it } from 'vitest';
import { categorizeDiseases, filterDiseases } from '../diseaseCatalog';
import type { Disease } from '../../types';

function createDisease(overrides: Partial<Disease>): Disease {
  return {
    id: 'base-disease',
    name: 'Базовая нозология',
    icd: 'N00',
    subtitle: 'Гинекология',
    description: 'Описание',
    icon: 'endometriosis',
    definition: 'Определение',
    epidemiology: 'Эпидемиология',
    etiology: ['Фактор'],
    symptoms: ['Симптом'],
    diagnostics: {
      steps: ['Осмотр'],
      markers: 'Маркер',
    },
    treatment: {
      conservative: ['Терапия'],
      surgical: ['Операция'],
      guidelines: {
        eau: 'EAU',
        acog: 'ACOG',
        ranzcog: 'RANZCOG',
        ru: 'RU',
      },
    },
    ...overrides,
  };
}

describe('diseaseCatalog', () => {
  it('uses explicit oncology override for VIN', () => {
    const categorized = categorizeDiseases([
      createDisease({ id: 'vin', name: 'VIN', description: 'Поражение вульвы' }),
    ]);

    expect(categorized[0].category).toBe('oncology');
  });

  it('uses explicit hormonal override for IVF-related entries', () => {
    const categorized = categorizeDiseases([
      createDisease({ id: 'ivf', name: 'ЭКО', description: 'Вспомогательные репродуктивные технологии' }),
    ]);

    expect(categorized[0].category).toBe('hormonal');
  });

  it('uses explicit infection override for postpartum endometritis', () => {
    const categorized = categorizeDiseases([
      createDisease({
        id: 'postpartum-endometritis',
        name: 'Послеродовый эндометрит',
        subtitle: 'Акушерство',
      }),
    ]);

    expect(categorized[0].category).toBe('infection');
  });

  it('matches synonym search for миома -> лейомиома', () => {
    const data = categorizeDiseases([
      createDisease({ id: 'fibroid', name: 'Лейомиома матки', description: 'Доброкачественная опухоль миометрия' }),
    ]);

    const filtered = filterDiseases({
      activeCategory: 'all',
      categorizedData: data,
      historyIds: new Set(),
      favoriteIds: new Set(),
      normalizedSearch: 'миома',
      showFavorites: false,
      showHistory: false,
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toContain('Лейомиома');
  });

  it('applies category filter after search', () => {
    const data = categorizeDiseases([
      createDisease({ id: 'ivf', name: 'ЭКО' }),
      createDisease({ id: 'gonorrhea', name: 'Гонорея' }),
    ]);

    const filtered = filterDiseases({
      activeCategory: 'infection',
      categorizedData: data,
      historyIds: new Set(),
      favoriteIds: new Set(),
      normalizedSearch: '',
      showFavorites: false,
      showHistory: false,
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('gonorrhea');
  });
});