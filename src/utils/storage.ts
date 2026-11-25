import { AISLES, AppData, DAYS_OF_WEEK, DISH_CATEGORIES, Dish } from '../types';
import { EMPTY_WEEK_PLAN, INITIAL_DATA } from '../data/initialData';

const STORAGE_KEY = 'a_table_menus_courses_v1';

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(raw);
    return sanitizeAppData(parsed);
  } catch {
    return INITIAL_DATA;
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function sanitizeAppData(raw: unknown): AppData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Format JSON invalide.');
  }

  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.dishes) || !obj.weekPlan || !Array.isArray(obj.shoppingList)) {
    throw new Error('Structure de sauvegarde incomplète.');
  }

  const dishes: Dish[] = obj.dishes
    .filter((d): d is Record<string, unknown> => Boolean(d && typeof d === 'object'))
    .map((d) => ({
      id: typeof d.id === 'string' && d.id ? d.id : createId('dish'),
      name: typeof d.name === 'string' && d.name.trim() ? d.name.trim() : 'Plat sans nom',
      category: DISH_CATEGORIES.includes(d.category as Dish['category'])
        ? (d.category as Dish['category'])
        : 'Rapide',
      ingredients: Array.isArray(d.ingredients)
        ? d.ingredients
            .filter((ing): ing is Record<string, unknown> => Boolean(ing && typeof ing === 'object'))
            .map((ing) => ({
              id: typeof ing.id === 'string' && ing.id ? ing.id : createId('ing'),
              name: typeof ing.name === 'string' ? ing.name.trim() : '',
              quantity: typeof ing.quantity === 'string' && ing.quantity.trim() ? ing.quantity.trim() : undefined,
              aisle: AISLES.includes(ing.aisle as (typeof AISLES)[number])
                ? (ing.aisle as (typeof AISLES)[number])
                : 'Autre',
            }))
            .filter((ing) => ing.name.length > 0)
        : [],
    }));

  const rawWeek = obj.weekPlan as Record<string, unknown>;
  const weekPlan = { ...EMPTY_WEEK_PLAN };
  for (const day of DAYS_OF_WEEK) {
    const dayObj = rawWeek[day];
    if (dayObj && typeof dayObj === 'object') {
      const typedDay = dayObj as Record<string, unknown>;
      weekPlan[day] = {
        midi: sanitizeMealEntry(typedDay.midi),
        soir: sanitizeMealEntry(typedDay.soir),
      };
    } else {
      weekPlan[day] = { midi: null, soir: null };
    }
  }

  const shoppingList = obj.shoppingList
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      id: typeof item.id === 'string' && item.id ? item.id : createId('shop'),
      name: typeof item.name === 'string' ? item.name.trim() : '',
      quantity: typeof item.quantity === 'string' && item.quantity.trim() ? item.quantity.trim() : undefined,
      aisle: AISLES.includes(item.aisle as (typeof AISLES)[number])
        ? (item.aisle as (typeof AISLES)[number])
        : 'Autre',
      checked: Boolean(item.checked),
      sourceDish: typeof item.sourceDish === 'string' && item.sourceDish.trim() ? item.sourceDish.trim() : undefined,
    }))
    .filter((item) => item.name.length > 0);

  return {
    version: 1,
    dishes,
    weekPlan,
    shoppingList,
  };
}

function sanitizeMealEntry(entry: unknown) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }
  const e = entry as Record<string, unknown>;
  if (typeof e.dishId === 'string' && e.dishId.trim()) {
    return { dishId: e.dishId.trim() };
  }
  if (typeof e.customLabel === 'string' && e.customLabel.trim()) {
    return { customLabel: e.customLabel.trim() };
  }
  return null;
}

export function exportAppDataToJson(data: AppData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `menus-courses-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
