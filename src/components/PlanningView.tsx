import React, { useState } from 'react';
import { Plus, RotateCcw, ShoppingBasket, Sun, Moon, Utensils } from 'lucide-react';
import {
  DAYS_OF_WEEK,
  DayOfWeek,
  Dish,
  MealEntry,
  MealMoment,
  WeekPlan,
} from '../types';
import { CATEGORY_ACCENTS } from '../utils/theme';
import { MealPickerSheet } from './MealPickerSheet';

interface PlanningViewProps {
  weekPlan: WeekPlan;
  dishes: Dish[];
  onUpdateSlot: (day: DayOfWeek, moment: MealMoment, entry: MealEntry | null) => void;
  onSendWeekToCourses: () => void;
  onSendDishToCourses: (dish: Dish) => void;
  onClearWeek: () => void;
}

export const PlanningView: React.FC<PlanningViewProps> = ({
  weekPlan,
  dishes,
  onUpdateSlot,
  onSendWeekToCourses,
  onSendDishToCourses,
  onClearWeek,
}) => {
  const [pickerTarget, setPickerTarget] = useState<{
    day: DayOfWeek;
    moment: MealMoment;
  } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const dishMap = new Map(dishes.map((d) => [d.id, d]));

  let plannedMealsCount = 0;
  let plannedRecipesCount = 0;
  for (const day of DAYS_OF_WEEK) {
    for (const moment of ['midi', 'soir'] as const) {
      const entry = weekPlan[day][moment];
      if (entry) {
        plannedMealsCount += 1;
        if (entry.dishId && dishMap.has(entry.dishId)) {
          plannedRecipesCount += 1;
        }
      }
    }
  }

  const currentPickerEntry = pickerTarget
    ? weekPlan[pickerTarget.day][pickerTarget.moment]
    : null;

  const renderSlot = (day: DayOfWeek, moment: MealMoment) => {
    const entry = weekPlan[day][moment];
    const dish = entry?.dishId ? dishMap.get(entry.dishId) : undefined;
    const isMidi = moment === 'midi';

    return (
      <div className="flex items-stretch gap-2 min-w-0">
        <button
          type="button"
          onClick={() => setPickerTarget({ day, moment })}
          className={`flex-1 min-w-0 min-h-[56px] px-3.5 py-2.5 rounded-xl border text-left transition-colors flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
            entry
              ? 'bg-stone-50/70 hover:bg-stone-100/80 border-stone-200'
              : 'bg-white hover:bg-emerald-50/40 border-dashed border-stone-300 hover:border-emerald-400'
          }`}
        >
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isMidi ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'
            }`}
            aria-hidden="true"
          >
            {isMidi ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </span>

          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium text-stone-500 leading-tight">
              {isMidi ? 'Midi' : 'Soir'}
            </div>
            {dish ? (
              <div className="mt-0.5">
                <div className="text-sm font-semibold text-stone-900 truncate">
                  {dish.name}
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-1.5">
                  <span className={`font-medium ${CATEGORY_ACCENTS[dish.category].text}`}>
                    {dish.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {dish.ingredients.length} ingrédient{dish.ingredients.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ) : entry?.customLabel ? (
              <div className="text-sm font-medium text-stone-800 truncate mt-0.5">
                {entry.customLabel}
              </div>
            ) : entry?.dishId ? (
              <div className="text-sm font-medium text-stone-500 italic mt-0.5">
                Plat supprimé
              </div>
            ) : (
              <div className="text-sm text-stone-400 flex items-center gap-1 mt-0.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Choisir un repas</span>
              </div>
            )}
          </div>
        </button>

        {dish && dish.ingredients.length > 0 && (
          <button
            type="button"
            onClick={() => onSendDishToCourses(dish)}
            title={`Ajouter les ingrédients de "${dish.name}" aux courses`}
            aria-label={`Envoyer les ingrédients de ${dish.name} aux courses`}
            className="min-w-[44px] min-h-[44px] px-2.5 rounded-xl border border-stone-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <ShoppingBasket className="w-[18px] h-[18px]" />
          </button>
        )}
      </div>
    );
  };

  return (
    <section aria-labelledby="planning-heading" className="space-y-6">
      {/* Header Summary & Primary Week Action */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 id="planning-heading" className="font-display text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
            Menus de la semaine
          </h1>
          <p className="text-sm text-stone-500 mt-1 tabular-nums">
            {plannedMealsCount === 0
              ? 'Aucun repas planifié pour le moment'
              : `${plannedMealsCount} repas planifié${plannedMealsCount > 1 ? 's' : ''} · ${plannedRecipesCount} recette${plannedRecipesCount > 1 ? 's' : ''} avec ingrédients`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {plannedMealsCount > 0 && (
            confirmClear ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClearWeek();
                    setConfirmClear(false);
                  }}
                  className="min-h-[44px] px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  Confirmer
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="min-h-[44px] px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors whitespace-nowrap"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="min-h-[44px] px-3.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Vider</span>
              </button>
            )
          )}

          <button
            type="button"
            onClick={onSendWeekToCourses}
            disabled={plannedRecipesCount === 0}
            className="flex-1 md:flex-initial min-w-0 min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-45 disabled:hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600"
          >
            <ShoppingBasket className="w-[18px] h-[18px] shrink-0" />
            <span>Envoyer les ingrédients aux courses</span>
          </button>
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayData = weekPlan[day];
          const filledCount = (dayData.midi ? 1 : 0) + (dayData.soir ? 1 : 0);

          return (
            <article
              key={day}
              className="bg-white border border-stone-200/90 rounded-2xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <h2 className="font-display text-base font-bold text-stone-900">
                  {day}
                </h2>
                <span className="text-xs text-stone-500 tabular-nums flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
                  {filledCount}/2 repas
                </span>
              </div>

              <div className="space-y-2.5">
                {renderSlot(day, 'midi')}
                {renderSlot(day, 'soir')}
              </div>
            </article>
          );
        })}
      </div>

      <MealPickerSheet
        isOpen={Boolean(pickerTarget)}
        day={pickerTarget?.day ?? null}
        moment={pickerTarget?.moment ?? null}
        currentEntry={currentPickerEntry}
        dishes={dishes}
        onClose={() => setPickerTarget(null)}
        onSelectMeal={(entry) => {
          if (pickerTarget) {
            onUpdateSlot(pickerTarget.day, pickerTarget.moment, entry);
          }
        }}
      />
    </section>
  );
};
