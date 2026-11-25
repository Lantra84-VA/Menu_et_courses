import React, { useState } from 'react';
import { Pencil, Plus, Search, ShoppingBasket, Trash2, UtensilsCrossed } from 'lucide-react';
import { DISH_CATEGORIES, Dish, DishCategory } from '../types';
import { CATEGORY_ACCENTS } from '../utils/theme';
import { DishFormModal } from './DishFormModal';

interface MesPlatsViewProps {
  dishes: Dish[];
  onSaveDish: (dish: Dish) => void;
  onDeleteDish: (id: string) => void;
  onSendDishToCourses: (dish: Dish) => void;
}

export const MesPlatsView: React.FC<MesPlatsViewProps> = ({
  dishes,
  onSaveDish,
  onDeleteDish,
  onSendDishToCourses,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DishCategory | 'Tous'>('Tous');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = categoryFilter === 'Tous' || dish.category === categoryFilter;
    const matchesSearch = dish.name.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenNew = () => {
    setEditingDish(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dish: Dish) => {
    setEditingDish(dish);
    setIsModalOpen(true);
  };

  return (
    <section aria-labelledby="plats-heading" className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 id="plats-heading" className="font-display text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
              Mes Plats
            </h1>
            <p className="text-sm text-stone-500 mt-1 tabular-nums">
              {dishes.length} recette{dishes.length > 1 ? 's' : ''} enregistrée{dishes.length > 1 ? 's' : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNew}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600"
          >
            <Plus className="w-[18px] h-[18px]" />
            <span>Ajouter un plat</span>
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 pt-2 border-t border-stone-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une recette..."
              aria-label="Rechercher une recette"
              className="w-full h-11 pl-10 pr-3.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['Tous', ...DISH_CATEGORIES] as const).map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`min-h-[40px] px-3.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dish Grid */}
      {filteredDishes.length === 0 ? (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-8 md:p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="font-display text-lg font-bold text-stone-900">
              {dishes.length === 0 ? 'Aucune recette enregistrée' : 'Aucun plat trouvé'}
            </h2>
            <p className="text-sm text-stone-500">
              {dishes.length === 0
                ? 'Créez vos plats favoris avec leurs ingrédients pour planifier vos repas en un clic.'
                : 'Essayez un autre mot-clé ou changez le filtre de catégorie.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDishes.map((dish) => {
            const accent = CATEGORY_ACCENTS[dish.category];
            const isConfirmingDelete = confirmDeleteId === dish.id;

            return (
              <article
                key={dish.id}
                className="bg-white border border-stone-200/90 rounded-2xl p-4 md:p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-stone-900 leading-snug">
                      {dish.name}
                    </h2>
                    {/* Clean unboxed metadata (Zero-Pill) */}
                    <div className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                      <span className={`font-semibold ${accent.text}`}>{dish.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {dish.ingredients.length} ingrédient{dish.ingredients.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {dish.ingredients.length > 0 ? (
                    <ul className="space-y-1.5 pt-2 border-t border-stone-100 text-sm text-stone-700">
                      {dish.ingredients.map((ing) => (
                        <li key={ing.id} className="flex items-baseline justify-between gap-2 text-[13px]">
                          <span className="truncate">
                            {ing.name}
                            {ing.quantity && (
                              <span className="text-stone-500 ml-1 tabular-nums">({ing.quantity})</span>
                            )}
                          </span>
                          <span className="text-[11px] text-stone-400 whitespace-nowrap shrink-0">
                            {ing.aisle}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-stone-400 italic pt-2 border-t border-stone-100">
                      Aucun ingrédient renseigné
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSendDishToCourses(dish)}
                    disabled={dish.ingredients.length === 0}
                    className="flex-1 min-h-[44px] px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <ShoppingBasket className="w-4 h-4" />
                    <span>Aux courses</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(dish)}
                    aria-label={`Modifier ${dish.name}`}
                    title="Modifier"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {isConfirmingDelete ? (
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteDish(dish.id);
                        setConfirmDeleteId(null);
                      }}
                      className="min-h-[44px] px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      Supprimer ?
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(dish.id)}
                      aria-label={`Supprimer ${dish.name}`}
                      title="Supprimer"
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-stone-200 bg-white hover:bg-rose-50 hover:text-rose-700 text-stone-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <DishFormModal
        isOpen={isModalOpen}
        initialDish={editingDish}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveDish}
      />
    </section>
  );
};
