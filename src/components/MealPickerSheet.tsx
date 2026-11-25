import React, { useEffect, useState } from 'react';
import { Dices, Search, Trash2, X } from 'lucide-react';
import {
  DISH_CATEGORIES,
  DayOfWeek,
  Dish,
  DishCategory,
  MealEntry,
  MealMoment,
} from '../types';
import { CATEGORY_ACCENTS } from '../utils/theme';

interface MealPickerSheetProps {
  isOpen: boolean;
  day: DayOfWeek | null;
  moment: MealMoment | null;
  currentEntry: MealEntry | null;
  dishes: Dish[];
  onClose: () => void;
  onSelectMeal: (entry: MealEntry | null) => void;
}

export const MealPickerSheet: React.FC<MealPickerSheetProps> = ({
  isOpen,
  day,
  moment,
  currentEntry,
  dishes,
  onClose,
  onSelectMeal,
}) => {
  const [mode, setMode] = useState<'plats' | 'libre'>('plats');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DishCategory | 'Tous'>('Tous');
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setCategoryFilter('Tous');
      if (currentEntry?.customLabel) {
        setMode('libre');
        setCustomText(currentEntry.customLabel);
      } else {
        setMode('plats');
        setCustomText('');
      }
    }
  }, [isOpen, currentEntry]);

  if (!isOpen || !day || !moment) {
    return null;
  }

  const filteredDishes = dishes.filter((d) => {
    const matchesCategory = categoryFilter === 'Tous' || d.category === categoryFilter;
    const matchesSearch = d.name.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRandomPick = () => {
    const pool = filteredDishes.length > 0 ? filteredDishes : dishes;
    if (pool.length === 0) return;
    const randomDish = pool[Math.floor(Math.random() * pool.length)];
    onSelectMeal({ dishId: randomDish.id });
    onClose();
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customText.trim();
    if (!trimmed) return;
    onSelectMeal({ customLabel: trimmed });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-stone-950/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meal-picker-title"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl border border-stone-200 shadow-xl max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="md:hidden pt-3 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-stone-300" aria-hidden="true" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 pt-3 pb-3 border-b border-stone-100 flex items-center justify-between gap-3 shrink-0">
          <div>
            <h2 id="meal-picker-title" className="font-display text-lg font-bold text-stone-900">
              {day} · {moment === 'midi' ? 'Midi' : 'Soir'}
            </h2>
            <p className="text-xs text-stone-500">
              Choisissez un plat enregistré ou notez un repas libre
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Mode Switch */}
        <div className="px-5 pt-3 shrink-0">
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('plats')}
              className={`min-h-[40px] text-sm font-semibold rounded-lg transition-colors ${
                mode === 'plats'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Depuis Mes Plats
            </button>
            <button
              type="button"
              onClick={() => setMode('libre')}
              className={`min-h-[40px] text-sm font-semibold rounded-lg transition-colors ${
                mode === 'libre'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Repas libre
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {mode === 'plats' ? (
            <div className="space-y-3">
              {/* Search & Random Idea */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un plat..."
                    className="w-full min-w-0 h-11 pl-9 pr-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRandomPick}
                  disabled={dishes.length === 0}
                  title="Choisir un plat au hasard"
                  className="h-11 px-3 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-40 transition-colors"
                >
                  <Dices className="w-4 h-4" />
                  <span>Au hasard</span>
                </button>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['Tous', ...DISH_CATEGORIES] as const).map((cat) => {
                  const active = categoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`min-h-[36px] px-3 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                        active
                          ? 'bg-emerald-700 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Dish List */}
              {filteredDishes.length === 0 ? (
                <div className="py-8 text-center text-sm text-stone-500">
                  {dishes.length === 0
                    ? 'Aucun plat enregistré pour le moment. Ajoutez-en dans "Mes Plats".'
                    : 'Aucun plat ne correspond à votre recherche.'}
                </div>
              ) : (
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                  {filteredDishes.map((dish) => {
                    const isSelected = currentEntry?.dishId === dish.id;
                    const accent = CATEGORY_ACCENTS[dish.category];
                    return (
                      <button
                        key={dish.id}
                        type="button"
                        onClick={() => {
                          onSelectMeal({ dishId: dish.id });
                          onClose();
                        }}
                        className={`w-full min-h-[56px] px-4 py-3 text-left flex items-center justify-between gap-3 transition-colors ${
                          isSelected ? 'bg-emerald-50/80' : 'bg-white hover:bg-stone-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-stone-900 truncate">
                            {dish.name}
                          </div>
                          <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                            <span className={`font-medium ${accent.text}`}>{dish.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">
                              {dish.ingredients.length} ingrédient{dish.ingredients.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-xs font-semibold text-emerald-700 whitespace-nowrap shrink-0">
                            Sélectionné
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveCustom} className="space-y-4">
              <div>
                <label htmlFor="custom-meal-input" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Nom du repas libre
                </label>
                <input
                  id="custom-meal-input"
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Ex. : Restes du frigo, Soirée crêpes, Restaurant..."
                  autoFocus
                  className="w-full h-12 px-3.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {['Restes du frigo', 'Pâtes rapides', 'Plateau fromage & pain', 'Chez des amis'].map(
                  (preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCustomText(preset)}
                      className="min-h-[36px] px-3 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                    >
                      {preset}
                    </button>
                  ),
                )}
              </div>

              <button
                type="submit"
                disabled={!customText.trim()}
                className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
              >
                Valider ce repas
              </button>
            </form>
          )}
        </div>

        {/* Footer Remove Action if slot is filled */}
        {currentEntry && (
          <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/70 shrink-0">
            <button
              type="button"
              onClick={() => {
                onSelectMeal(null);
                onClose();
              }}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 text-sm font-medium text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Retirer ce repas du planning</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
