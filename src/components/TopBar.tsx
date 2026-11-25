import React from 'react';
import { AppTab } from '../types';

interface TopBarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  uncheckedCount: number;
  onOpenBackup: (mode: 'export' | 'import') => void;
}

const NAV_ITEMS: { id: AppTab; label: string }[] = [
  { id: 'planning', label: 'Planning' },
  { id: 'courses', label: 'Courses' },
  { id: 'plats', label: 'Mes Plats' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  uncheckedCount,
  onOpenBackup,
}) => {
  return (
    <header className="sticky top-0 z-30 h-13 md:h-16 bg-white/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-3 md:gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('planning')}
          className="font-display text-lg md:text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md px-1"
        >
          À Table
        </button>

        {/* Zone 2: Desktop single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-sm ${
                  isActive
                    ? 'text-emerald-800 font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {item.label}
                  {item.id === 'courses' && uncheckedCount > 0 && (
                    <span className="tabular-nums text-xs font-semibold text-emerald-700">
                      ({uncheckedCount})
                    </span>
                  )}
                </span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Readable JSON Export & Import buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenBackup('export')}
            title="Exporter vers Google Drive ou en fichier .json"
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 text-stone-700 hover:text-emerald-800 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            Exporter
          </button>
          <button
            type="button"
            onClick={() => onOpenBackup('import')}
            title="Importer depuis Google Drive ou un fichier .json"
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 text-stone-700 hover:text-emerald-800 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            Importer
          </button>
        </div>
      </div>
    </header>
  );
};
