import React, { useState } from 'react';
import { Check, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { AISLES, Aisle, ShoppingItem } from '../types';
import { AISLE_META } from '../utils/theme';

interface CoursesViewProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (name: string, aisle: Aisle, quantity?: string) => void;
  onRemoveItem: (id: string) => void;
  onClearChecked: () => void;
  onGoToPlanning: () => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  items,
  onToggleItem,
  onAddItem,
  onRemoveItem,
  onClearChecked,
  onGoToPlanning,
}) => {
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newAisle, setNewAisle] = useState<Aisle>('Fruits & Légumes');

  const checkedCount = items.filter((i) => i.checked).length;
  const remainingCount = items.length - checkedCount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddItem(trimmed, newAisle, newQty.trim() || undefined);
    setNewName('');
    setNewQty('');
  };

  return (
    <section aria-labelledby="courses-heading" className="space-y-6">
      {/* Header & Manual Add Form */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 id="courses-heading" className="font-display text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
              Liste de courses
            </h1>
            <p className="text-sm text-stone-500 mt-1 tabular-nums">
              {items.length === 0
                ? 'Votre liste est vide'
                : remainingCount === 0
                  ? `Tout est dans le panier (${items.length} article${items.length > 1 ? 's' : ''})`
                  : `${remainingCount} article${remainingCount > 1 ? 's' : ''} restant${remainingCount > 1 ? 's' : ''} · ${checkedCount} coché${checkedCount > 1 ? 's' : ''}`}
            </p>
          </div>

          {checkedCount > 0 && (
            <button
              type="button"
              onClick={onClearChecked}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
            >
              <Trash2 className="w-4 h-4" />
              <span className="tabular-nums">Supprimer les cochés ({checkedCount})</span>
            </button>
          )}
        </div>

        {/* Manual Item Quick Add */}
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-2.5 pt-2 border-t border-stone-100">
          <div className="col-span-12 md:col-span-5 min-w-0">
            <label htmlFor="add-course-name" className="sr-only">
              Nom de l'article
            </label>
            <input
              id="add-course-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ajouter un article (ex. Beurre, Tomates...)"
              className="w-full min-w-0 h-12 px-3.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <div className="col-span-5 md:col-span-2 min-w-0">
            <label htmlFor="add-course-qty" className="sr-only">
              Quantité (optionnel)
            </label>
            <input
              id="add-course-qty"
              type="text"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              placeholder="Qté (opt.)"
              className="w-full min-w-0 h-12 px-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <div className="col-span-7 md:col-span-3 min-w-0">
            <label htmlFor="add-course-aisle" className="sr-only">
              Rayon
            </label>
            <select
              id="add-course-aisle"
              value={newAisle}
              onChange={(e) => setNewAisle(e.target.value as Aisle)}
              className="w-full min-w-0 h-12 px-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            >
              {AISLES.map((aisle) => (
                <option key={aisle} value={aisle}>
                  {aisle}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-12 md:col-span-2 min-w-0">
            <button
              type="submit"
              disabled={!newName.trim()}
              className="w-full h-12 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Ajouter</span>
            </button>
          </div>
        </form>
      </div>

      {/* Empty State or Aisle Groups */}
      {items.length === 0 ? (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-8 md:p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="font-display text-lg font-bold text-stone-900">
              Aucun article à acheter
            </h2>
            <p className="text-sm text-stone-500">
              Ajoutez un article manuellement ci-dessus ou envoyez les ingrédients de vos repas depuis le Planning.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToPlanning}
            className="min-h-[44px] px-5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-sm font-semibold text-stone-800 transition-colors"
          >
            Aller au Planning
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {AISLES.map((aisle) => {
            const aisleItems = items
              .filter((item) => item.aisle === aisle)
              .sort((a, b) => Number(a.checked) - Number(b.checked));

            if (aisleItems.length === 0) {
              return null;
            }

            const aisleRemaining = aisleItems.filter((i) => !i.checked).length;
            const meta = AISLE_META[aisle];

            return (
              <section
                key={aisle}
                aria-label={`Rayon ${aisle}`}
                className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden"
              >
                <div className={`px-4 py-3 border-b border-stone-100 flex items-center justify-between ${meta.surfaceTint}`}>
                  <h2 className={`font-display text-sm font-bold tracking-tight ${meta.headerText}`}>
                    {aisle}
                  </h2>
                  <span className="text-xs font-medium text-stone-600 tabular-nums">
                    {aisleRemaining === 0
                      ? 'Complet'
                      : `${aisleRemaining} à prendre`}
                  </span>
                </div>

                <ul className="divide-y divide-stone-100">
                  {aisleItems.map((item) => (
                    <li
                      key={item.id}
                      className={`flex items-center transition-colors ${
                        item.checked ? 'bg-stone-50/70' : 'bg-white hover:bg-stone-50/60'
                      }`}
                    >
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={item.checked}
                        onClick={() => onToggleItem(item.id)}
                        className="flex-1 min-h-[60px] px-4 py-3 flex items-center gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
                      >
                        {/* Large tactile checkbox visual */}
                        <span
                          aria-hidden="true"
                          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                            item.checked
                              ? 'bg-emerald-700 border-emerald-700 text-white scale-95'
                              : 'bg-white border-stone-300 text-transparent'
                          }`}
                        >
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-[15px] font-medium leading-snug transition-colors ${
                              item.checked ? 'line-through text-stone-400' : 'text-stone-900'
                            }`}
                          >
                            {item.name}
                          </div>
                          {(item.quantity || item.sourceDish) && (
                            <div className="text-xs text-stone-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                              {item.quantity && (
                                <span className="font-medium text-stone-600 tabular-nums">
                                  {item.quantity}
                                </span>
                              )}
                              {item.quantity && item.sourceDish && (
                                <span aria-hidden="true">·</span>
                              )}
                              {item.sourceDish && (
                                <span className="truncate">{item.sourceDish}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        aria-label={`Supprimer ${item.name}`}
                        title="Supprimer cet article"
                        className="min-w-[48px] min-h-[56px] px-3 flex items-center justify-center text-stone-400 hover:text-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
};
