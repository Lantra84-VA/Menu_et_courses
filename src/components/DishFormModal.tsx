import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import {
  AISLES,
  Aisle,
  DISH_CATEGORIES,
  Dish,
  DishCategory,
  Ingredient,
} from '../types';
import { createId } from '../utils/storage';

interface DishFormModalProps {
  isOpen: boolean;
  initialDish: Dish | null;
  onClose: () => void;
  onSave: (dish: Dish) => void;
}

export const DishFormModal: React.FC<DishFormModalProps> = ({
  isOpen,
  initialDish,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DishCategory>('Viande');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [newIngName, setNewIngName] = useState('');
  const [newIngQty, setNewIngQty] = useState('');
  const [newIngAisle, setNewIngAisle] = useState<Aisle>('Fruits & Légumes');

  useEffect(() => {
    if (isOpen) {
      if (initialDish) {
        setName(initialDish.name);
        setCategory(initialDish.category);
        setIngredients(initialDish.ingredients.map((i) => ({ ...i })));
      } else {
        setName('');
        setCategory('Viande');
        setIngredients([]);
      }
      setNewIngName('');
      setNewIngQty('');
      setNewIngAisle('Fruits & Légumes');
    }
  }, [isOpen, initialDish]);

  if (!isOpen) {
    return null;
  }

  const handleAddIngredient = () => {
    const trimmed = newIngName.trim();
    if (!trimmed) return;
    setIngredients((prev) => [
      ...prev,
      {
        id: createId('ing'),
        name: trimmed,
        quantity: newIngQty.trim() || undefined,
        aisle: newIngAisle,
      },
    ]);
    setNewIngName('');
    setNewIngQty('');
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Include any pending ingredient typed in the input if the user forgot to click +
    const finalIngredients = [...ingredients];
    if (newIngName.trim()) {
      finalIngredients.push({
        id: createId('ing'),
        name: newIngName.trim(),
        quantity: newIngQty.trim() || undefined,
        aisle: newIngAisle,
      });
    }

    onSave({
      id: initialDish ? initialDish.id : createId('dish'),
      name: trimmedName,
      category,
      ingredients: finalIngredients,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-stone-950/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dish-form-title"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-xl bg-white rounded-t-3xl md:rounded-2xl border border-stone-200 shadow-xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag affordance */}
        <div className="md:hidden pt-3 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-stone-300" aria-hidden="true" />
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-3 border-b border-stone-100 flex items-center justify-between gap-3 shrink-0">
          <h2 id="dish-form-title" className="font-display text-lg font-bold text-stone-900">
            {initialDish ? 'Modifier le plat' : 'Nouveau plat favori'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Dish Name */}
          <div>
            <label htmlFor="dish-name-input" className="block text-sm font-semibold text-stone-800 mb-1.5">
              Nom du plat
            </label>
            <input
              id="dish-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. : Gratin dauphinois, Poulet rôti..."
              className="w-full h-12 px-3.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Category */}
          <div>
            <span className="block text-sm font-semibold text-stone-800 mb-1.5">
              Catégorie
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DISH_CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`min-h-[44px] px-3 text-sm font-medium rounded-xl border transition-colors ${
                      active
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ingredients Builder */}
          <div className="space-y-3 pt-1 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-800">
                Ingrédients ({ingredients.length})
              </span>
              <span className="text-xs text-stone-500">Classés par rayon</span>
            </div>

            {/* Add Ingredient Row */}
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 space-y-2.5">
              <div className="grid grid-cols-12 gap-2">
                <input
                  type="text"
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIngredient();
                    }
                  }}
                  placeholder="Ingrédient (ex. Carottes)"
                  aria-label="Nom de l'ingrédient"
                  className="col-span-12 min-w-0 h-11 px-3 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <input
                  type="text"
                  value={newIngQty}
                  onChange={(e) => setNewIngQty(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIngredient();
                    }
                  }}
                  placeholder="Qté (ex. 500 g)"
                  aria-label="Quantité"
                  className="col-span-5 min-w-0 h-11 px-3 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <select
                  value={newIngAisle}
                  onChange={(e) => setNewIngAisle(e.target.value as Aisle)}
                  aria-label="Rayon de l'ingrédient"
                  className="col-span-7 min-w-0 h-11 px-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {AISLES.map((aisle) => (
                    <option key={aisle} value={aisle}>
                      {aisle}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddIngredient}
                disabled={!newIngName.trim()}
                className="w-full min-h-[40px] rounded-xl bg-white hover:bg-stone-100 disabled:opacity-45 border border-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter cet ingrédient à la liste</span>
              </button>
            </div>

            {/* Ingredient List */}
            {ingredients.length > 0 ? (
              <ul className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                {ingredients.map((ing) => (
                  <li
                    key={ing.id}
                    className="px-3.5 py-2.5 bg-white flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-stone-900 truncate">
                        {ing.name}
                        {ing.quantity && (
                          <span className="text-stone-500 font-normal ml-1.5 tabular-nums">
                            ({ing.quantity})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500">{ing.aisle}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(ing.id)}
                      aria-label={`Retirer ${ing.name}`}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-500 text-center py-2">
                Aucun ingrédient ajouté pour le moment.
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
            >
              {initialDish ? 'Enregistrer les modifications' : 'Enregistrer le plat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
