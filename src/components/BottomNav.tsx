import React from 'react';
import { CalendarDays, ShoppingBasket, UtensilsCrossed } from 'lucide-react';
import { AppTab } from '../types';

interface BottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  uncheckedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  uncheckedCount,
}) => {
  const tabs: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'planning',
      label: 'Planning',
      icon: <CalendarDays className="w-[22px] h-[22px]" strokeWidth={activeTab === 'planning' ? 2.3 : 1.8} />,
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: <ShoppingBasket className="w-[22px] h-[22px]" strokeWidth={activeTab === 'courses' ? 2.3 : 1.8} />,
    },
    {
      id: 'plats',
      label: 'Mes Plats',
      icon: <UtensilsCrossed className="w-[22px] h-[22px]" strokeWidth={activeTab === 'plats' ? 2.3 : 1.8} />,
    },
  ];

  return (
    <nav
      aria-label="Navigation mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 pb-safe"
    >
      <div className="grid grid-cols-3 h-14">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600 ${
                isActive ? 'text-emerald-700' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="relative">
                {tab.icon}
                {tab.id === 'courses' && uncheckedCount > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-3 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold tabular-nums flex items-center justify-center ${
                      isActive
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-800 text-white'
                    }`}
                  >
                    {uncheckedCount > 99 ? '99+' : uncheckedCount}
                  </span>
                )}
              </span>
              <span
                className={`text-[11px] leading-none mt-1 tracking-tight whitespace-nowrap ${
                  isActive ? 'font-semibold' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
