import { AppData, Dish, WeekPlan } from '../types';

export const INITIAL_DISHES: Dish[] = [
  {
    id: 'dish-bourguignon',
    name: 'Boeuf Bourguignon',
    category: 'Viande',
    ingredients: [
      { id: 'ing-b1', name: 'Boeuf à braiser', quantity: '800 g', aisle: 'Frais & Crèmerie' },
      { id: 'ing-b2', name: 'Lardons fumés', quantity: '150 g', aisle: 'Frais & Crèmerie' },
      { id: 'ing-b3', name: 'Carottes', quantity: '4', aisle: 'Fruits & Légumes' },
      { id: 'ing-b4', name: 'Oignons jaunes', quantity: '2', aisle: 'Fruits & Légumes' },
      { id: 'ing-b5', name: 'Champignons de Paris', quantity: '250 g', aisle: 'Fruits & Légumes' },
      { id: 'ing-b6', name: 'Vin rouge de Bourgogne', quantity: '1 bouteille', aisle: 'Épicerie' },
      { id: 'ing-b7', name: 'Bouquet garni & bouillon', quantity: '1', aisle: 'Épicerie' },
    ],
  },
  {
    id: 'dish-quiche-lorraine',
    name: 'Quiche Lorraine & Salade verte',
    category: 'Rapide',
    ingredients: [
      { id: 'ing-q1', name: 'Pâte brisée', quantity: '1 rouleau', aisle: 'Frais & Crèmerie' },
      { id: 'ing-q2', name: 'Lardons nature', quantity: '200 g', aisle: 'Frais & Crèmerie' },
      { id: 'ing-q3', name: 'Oeufs frais', quantity: '4', aisle: 'Frais & Crèmerie' },
      { id: 'ing-q4', name: 'Crème fraîche épaisse', quantity: '20 cl', aisle: 'Frais & Crèmerie' },
      { id: 'ing-q5', name: 'Lait demi-écrémé', quantity: '20 cl', aisle: 'Frais & Crèmerie' },
      { id: 'ing-q6', name: 'Salade verte (batavia ou laitue)', quantity: '1', aisle: 'Fruits & Légumes' },
    ],
  },
  {
    id: 'dish-saumon-poireaux',
    name: 'Pavés de Saumon & Fondue de Poireaux',
    category: 'Poisson',
    ingredients: [
      { id: 'ing-s1', name: 'Pavés de saumon', quantity: '2', aisle: 'Frais & Crèmerie' },
      { id: 'ing-s2', name: 'Poireaux', quantity: '3', aisle: 'Fruits & Légumes' },
      { id: 'ing-s3', name: 'Citron jaune', quantity: '1', aisle: 'Fruits & Légumes' },
      { id: 'ing-s4', name: 'Crème fraîche liquide', quantity: '15 cl', aisle: 'Frais & Crèmerie' },
      { id: 'ing-s5', name: 'Riz basmati', quantity: '250 g', aisle: 'Épicerie' },
    ],
  },
];

export const EMPTY_WEEK_PLAN: WeekPlan = {
  Lundi: { midi: null, soir: null },
  Mardi: { midi: null, soir: null },
  Mercredi: { midi: null, soir: null },
  Jeudi: { midi: null, soir: null },
  Vendredi: { midi: null, soir: null },
  Samedi: { midi: null, soir: null },
  Dimanche: { midi: null, soir: null },
};

export const INITIAL_WEEK_PLAN: WeekPlan = {
  Lundi: { midi: { dishId: 'dish-quiche-lorraine' }, soir: { dishId: 'dish-saumon-poireaux' } },
  Mardi: { midi: { customLabel: 'Restes de saumon & riz' }, soir: null },
  Mercredi: { midi: null, soir: null },
  Jeudi: { midi: null, soir: null },
  Vendredi: { midi: null, soir: null },
  Samedi: { midi: null, soir: { dishId: 'dish-bourguignon' } },
  Dimanche: { midi: null, soir: null },
};

export const INITIAL_DATA: AppData = {
  version: 1,
  dishes: INITIAL_DISHES,
  weekPlan: INITIAL_WEEK_PLAN,
  shoppingList: [
    {
      id: 'shop-demo-1',
      name: 'Pain de campagne',
      quantity: '1',
      aisle: 'Épicerie',
      checked: false,
    },
    {
      id: 'shop-demo-2',
      name: 'Pommes Golden',
      quantity: '6',
      aisle: 'Fruits & Légumes',
      checked: false,
    },
  ],
};
