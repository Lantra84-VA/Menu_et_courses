import { Aisle, DishCategory } from '../types';

export const CATEGORY_ACCENTS: Record<
  DishCategory,
  { text: string; dot: string; activeBg: string; border: string }
> = {
  Viande: {
    text: 'text-rose-700',
    dot: 'bg-rose-600',
    activeBg: 'bg-rose-50 text-rose-800 border-rose-200',
    border: 'border-rose-200',
  },
  Poisson: {
    text: 'text-sky-700',
    dot: 'bg-sky-600',
    activeBg: 'bg-sky-50 text-sky-800 border-sky-200',
    border: 'border-sky-200',
  },
  Végétarien: {
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    activeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    border: 'border-emerald-200',
  },
  Rapide: {
    text: 'text-amber-700',
    dot: 'bg-amber-600',
    activeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    border: 'border-amber-200',
  },
};

export const AISLE_META: Record<
  Aisle,
  { headerText: string; surfaceTint: string; dot: string }
> = {
  'Fruits & Légumes': {
    headerText: 'text-emerald-800',
    surfaceTint: 'bg-emerald-50/70',
    dot: 'bg-emerald-600',
  },
  'Frais & Crèmerie': {
    headerText: 'text-sky-800',
    surfaceTint: 'bg-sky-50/70',
    dot: 'bg-sky-600',
  },
  Épicerie: {
    headerText: 'text-amber-800',
    surfaceTint: 'bg-amber-50/70',
    dot: 'bg-amber-600',
  },
  Surgelés: {
    headerText: 'text-indigo-800',
    surfaceTint: 'bg-indigo-50/70',
    dot: 'bg-indigo-600',
  },
  Autre: {
    headerText: 'text-stone-700',
    surfaceTint: 'bg-stone-100/80',
    dot: 'bg-stone-500',
  },
};
