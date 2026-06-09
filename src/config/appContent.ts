import type { TabType } from '../types';

export const emptyStateContent = {
  favorites: {
    eyebrow: 'Избранное',
    title: 'Список избранного пока пуст',
    description: 'Сохраняйте важные нозологии и возвращайтесь к ним без повторного поиска.',
  },
  history: {
    eyebrow: 'История',
    title: 'Вы ещё не открывали материалы',
    description: 'После просмотра карточек здесь появится история переходов по разделам и нозологиям.',
  },
  search: {
    eyebrow: 'Поиск',
    title: 'Ничего не найдено',
    description: 'Попробуйте изменить запрос или снять часть фильтров, чтобы расширить выдачу.',
  },
} as const;

export const homeActions = [
  {
    title: 'Гинекология',
    description: 'Нозологии, диагностика, лечение и быстрый переход к нужным клиническим карточкам.',
    badge: 'Раздел',
    onClick: (setActiveTab: (tab: TabType) => void) => setActiveTab('gynecology'),
  },
  {
    title: 'Акушерство',
    description: 'Беременность, осложнения, наблюдение и маршруты ведения в одном клиническом контуре.',
    badge: 'Раздел',
    onClick: (setActiveTab: (tab: TabType) => void) => setActiveTab('obstetrics'),
  },
  {
    title: 'Опросники',
    description: 'Быстрый доступ к шкалам и клиническим анкетам в одном окне.',
    badge: 'Инструменты',
    onClick: (_setActiveTab: (tab: TabType) => void, openQuestionnaire: () => void) => openQuestionnaire(),
  },
  {
    title: 'Фармакология',
    description: 'Препараты, режимы и клинические ориентиры для повседневной практики.',
    badge: 'Инструменты',
    onClick: (_setActiveTab: (tab: TabType) => void, _openQuestionnaire: () => void, openPharmacology: () => void) =>
      openPharmacology(),
  },
] as const;

export const sectionMeta = {
  gynecology: {
    eyebrow: 'Каталог',
    title: 'Гинекология',
    description: 'Нозологии, диагностика, лечение и быстрый доступ к клиническим карточкам.',
    loadingTitle: 'Загружаем каталог гинекологии',
  },
  obstetrics: {
    eyebrow: 'Каталог',
    title: 'Акушерство',
    description: 'Материалы по беременности, осложнениям, наблюдению и маршрутам ведения.',
    loadingTitle: 'Загружаем каталог акушерства',
  },
} as const;