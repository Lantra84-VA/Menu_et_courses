export type AppTab = 'planning' | 'courses' | 'plats';

export const DISH_CATEGORIES = ['Viande', 'Poisson', 'Végétarien', 'Rapide'] as const;
export type DishCategory = (typeof DISH_CATEGORIES)[number];

export const AISLES = [
  'Fruits & Légumes',
  'Frais & Crèmerie',
  'Épicerie',
  'Surgelés',
  'Autre',
] as const;
export type Aisle = (typeof AISLES)[number];

export const DAYS_OF_WEEK = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export type MealMoment = 'midi' | 'soir';

export interface Ingredient {
  id: string;
  name: string;
  quantity?: string;
  aisle: Aisle;
}

export interface Dish {
  id: string;
  name: string;
  category: DishCategory;
  ingredients: Ingredient[];
}

export interface MealEntry {
  dishId?: string;
  customLabel?: string;
}

export type DayPlan = {
  midi: MealEntry | null;
  soir: MealEntry | null;
};

export type WeekPlan = Record<DayOfWeek, DayPlan>;

export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  aisle: Aisle;
  checked: boolean;
  sourceDish?: string;
}

export interface AppData {
  version: number;
  dishes: Dish[];
  weekPlan: WeekPlan;
  shoppingList: ShoppingItem[];
}
