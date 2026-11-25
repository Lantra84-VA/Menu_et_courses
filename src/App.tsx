import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Aisle,
  AppData,
  AppTab,
  DAYS_OF_WEEK,
  DayOfWeek,
  Dish,
  MealEntry,
  MealMoment,
  ShoppingItem,
} from './types';
import { EMPTY_WEEK_PLAN } from './data/initialData';
import {
  createId,
  exportAppDataToJson,
  loadAppData,
  sanitizeAppData,
  saveAppData,
} from './utils/storage';
import { initAuth } from './utils/googleDrive';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { PlanningView } from './components/PlanningView';
import { CoursesView } from './components/CoursesView';
import { MesPlatsView } from './components/MesPlatsView';
import { BackupModal } from './components/BackupModal';

interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

export default function App() {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [activeTab, setActiveTab] = useState<AppTab>('planning');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [backupModalMode, setBackupModalMode] = useState<'export' | 'import' | null>(null);
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
        setNeedsAuth(false);
      },
      (user) => {
        setGoogleUser(user);
        setNeedsAuth(true);
      },
    );
    return () => unsubscribe();
  }, []);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (
    text: string,
    type: 'success' | 'error' = 'success',
    actionLabel?: string,
    onAction?: () => void,
  ) => {
    setToast({ id: Date.now(), text, type, actionLabel, onAction });
  };

  const appendIngredientsToShoppingList = (
    currentList: ShoppingItem[],
    dishesToAdd: Dish[],
  ): { nextList: ShoppingItem[]; addedCount: number } => {
    const nextList = currentList.map((item) => ({ ...item }));
    let addedCount = 0;

    for (const dish of dishesToAdd) {
      for (const ing of dish.ingredients) {
        const normalizedName = ing.name.trim().toLowerCase();
        const existingIndex = nextList.findIndex(
          (item) =>
            !item.checked &&
            item.name.trim().toLowerCase() === normalizedName &&
            item.aisle === ing.aisle,
        );

        if (existingIndex >= 0) {
          const existing = nextList[existingIndex];
          const sources = new Set(
            [existing.sourceDish, dish.name].filter((s): s is string => Boolean(s)),
          );
          const mergedQty =
            existing.quantity && ing.quantity && existing.quantity !== ing.quantity
              ? `${existing.quantity} + ${ing.quantity}`
              : existing.quantity || ing.quantity;
          nextList[existingIndex] = {
            ...existing,
            quantity: mergedQty,
            sourceDish: Array.from(sources).join(', '),
          };
          addedCount += 1;
        } else {
          nextList.push({
            id: createId('shop'),
            name: ing.name,
            quantity: ing.quantity,
            aisle: ing.aisle,
            checked: false,
            sourceDish: dish.name,
          });
          addedCount += 1;
        }
      }
    }

    return { nextList, addedCount };
  };

  const handleUpdateSlot = (day: DayOfWeek, moment: MealMoment, entry: MealEntry | null) => {
    setData((prev) => ({
      ...prev,
      weekPlan: {
        ...prev.weekPlan,
        [day]: {
          ...prev.weekPlan[day],
          [moment]: entry,
        },
      },
    }));
  };

  const handleClearWeek = () => {
    setData((prev) => ({
      ...prev,
      weekPlan: { ...EMPTY_WEEK_PLAN },
    }));
    showToast('Planning de la semaine vidé.');
  };

  const handleSendWeekToCourses = () => {
    const dishMap = new Map(data.dishes.map((d) => [d.id, d]));
    const plannedDishes: Dish[] = [];

    for (const day of DAYS_OF_WEEK) {
      for (const moment of ['midi', 'soir'] as const) {
        const entry = data.weekPlan[day][moment];
        if (entry?.dishId) {
          const dish = dishMap.get(entry.dishId);
          if (dish && dish.ingredients.length > 0) {
            plannedDishes.push(dish);
          }
        }
      }
    }

    if (plannedDishes.length === 0) {
      showToast('Aucun ingrédient à ajouter depuis le planning.', 'error');
      return;
    }

    const { nextList, addedCount } = appendIngredientsToShoppingList(
      data.shoppingList,
      plannedDishes,
    );

    setData((prev) => ({ ...prev, shoppingList: nextList }));
    showToast(
      `${addedCount} ingrédient${addedCount > 1 ? 's' : ''} envoyé${addedCount > 1 ? 's' : ''} aux courses.`,
      'success',
      'Voir la liste',
      () => setActiveTab('courses'),
    );
  };

  const handleSendDishToCourses = (dish: Dish) => {
    if (dish.ingredients.length === 0) {
      showToast('Ce plat ne contient aucun ingrédient.', 'error');
      return;
    }

    const { nextList, addedCount } = appendIngredientsToShoppingList(
      data.shoppingList,
      [dish],
    );

    setData((prev) => ({ ...prev, shoppingList: nextList }));
    showToast(
      `${addedCount} ingrédient${addedCount > 1 ? 's' : ''} de "${dish.name}" ajouté${addedCount > 1 ? 's' : ''}.`,
      'success',
      'Voir la liste',
      () => setActiveTab('courses'),
    );
  };

  const handleToggleShoppingItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      shoppingList: prev.shoppingList.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    }));
  };

  const handleAddShoppingItem = (name: string, aisle: Aisle, quantity?: string) => {
    const newItem: ShoppingItem = {
      id: createId('shop'),
      name,
      quantity,
      aisle,
      checked: false,
    };
    setData((prev) => ({
      ...prev,
      shoppingList: [newItem, ...prev.shoppingList],
    }));
  };

  const handleRemoveShoppingItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      shoppingList: prev.shoppingList.filter((item) => item.id !== id),
    }));
  };

  const handleClearCheckedShoppingItems = () => {
    setData((prev) => ({
      ...prev,
      shoppingList: prev.shoppingList.filter((item) => !item.checked),
    }));
    showToast('Articles cochés supprimés.');
  };

  const handleSaveDish = (dish: Dish) => {
    setData((prev) => {
      const exists = prev.dishes.some((d) => d.id === dish.id);
      const nextDishes = exists
        ? prev.dishes.map((d) => (d.id === dish.id ? dish : d))
        : [dish, ...prev.dishes];
      return { ...prev, dishes: nextDishes };
    });
    showToast(`"${dish.name}" enregistré.`);
  };

  const handleDeleteDish = (id: string) => {
    setData((prev) => ({
      ...prev,
      dishes: prev.dishes.filter((d) => d.id !== id),
    }));
    showToast('Plat supprimé.');
  };

  const handleExportLocal = () => {
    exportAppDataToJson(data);
    showToast('Sauvegarde .JSON téléchargée sur cet appareil !');
  };

  const handleImportLocalFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result ?? ''));
        const validated = sanitizeAppData(parsed);
        setData(validated);
        showToast('Sauvegarde .JSON importée avec succès !');
      } catch {
        showToast('Fichier .JSON invalide ou incompatible.', 'error');
      }
    };
    reader.onerror = () => {
      showToast('Impossible de lire ce fichier.', 'error');
    };
    reader.readAsText(file);
  };

  const handleRestoreData = (restored: AppData, message: string) => {
    setData(restored);
    showToast(message);
  };

  const uncheckedCount = data.shoppingList.filter((i) => !i.checked).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F4] text-stone-900 overflow-x-clip">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        uncheckedCount={uncheckedCount}
        onOpenBackup={(mode) => setBackupModalMode(mode)}
      />

      <main className="flex-1 w-full min-w-0 max-w-6xl mx-auto px-4 md:px-6 pt-5 md:pt-8 pb-24 md:pb-12">
        {activeTab === 'planning' && (
          <PlanningView
            weekPlan={data.weekPlan}
            dishes={data.dishes}
            onUpdateSlot={handleUpdateSlot}
            onSendWeekToCourses={handleSendWeekToCourses}
            onSendDishToCourses={handleSendDishToCourses}
            onClearWeek={handleClearWeek}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesView
            items={data.shoppingList}
            onToggleItem={handleToggleShoppingItem}
            onAddItem={handleAddShoppingItem}
            onRemoveItem={handleRemoveShoppingItem}
            onClearChecked={handleClearCheckedShoppingItems}
            onGoToPlanning={() => setActiveTab('planning')}
          />
        )}

        {activeTab === 'plats' && (
          <MesPlatsView
            dishes={data.dishes}
            onSaveDish={handleSaveDish}
            onDeleteDish={handleDeleteDish}
            onSendDishToCourses={handleSendDishToCourses}
          />
        )}
      </main>

      <BackupModal
        isOpen={backupModalMode !== null}
        initialMode={backupModalMode ?? 'export'}
        user={googleUser}
        needsAuth={needsAuth}
        data={data}
        onClose={() => setBackupModalMode(null)}
        onAuthSuccess={(user) => {
          setGoogleUser(user);
          setNeedsAuth(false);
        }}
        onLoggedOut={() => {
          setNeedsAuth(true);
        }}
        onExportLocal={handleExportLocal}
        onImportLocalFile={handleImportLocalFile}
        onRestoreData={handleRestoreData}
        onNotify={(text, type) => showToast(text, type)}
      />

      {/* Non-blocking Toast Feedback */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-18 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-lg border bg-stone-900 text-white border-stone-800"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="text-sm font-medium truncate">{toast.text}</span>
          </div>
          {toast.actionLabel && toast.onAction && (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                setToast(null);
              }}
              className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 whitespace-nowrap shrink-0 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
      )}

      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        uncheckedCount={uncheckedCount}
      />
    </div>
  );
}
