import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { AppTheme } from '../types';
import { ThemeService } from '../services/themeService';

interface ThemeSwitcherProps {
  currentTheme: AppTheme;
  onThemeChange?: (theme: AppTheme) => void;
  className?: string;
  variant?: 'pill' | 'dropdown' | 'buttons';
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  currentTheme,
  onThemeChange,
  className = '',
  variant = 'pill',
}) => {
  const handleSelect = (theme: AppTheme) => {
    ThemeService.setTheme(theme);
    if (onThemeChange) {
      onThemeChange(theme);
    }
  };

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center p-1 rounded-full bg-slate-100 dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] shadow-xs ${className}`}>
        <button
          type="button"
          onClick={() => handleSelect('claro')}
          title="Tema Claro"
          className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
            currentTheme === 'claro'
              ? 'bg-[#146ef5] text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleSelect('oscuro')}
          title="Tema Oscuro"
          className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
            currentTheme === 'oscuro'
              ? 'bg-[#146ef5] text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleSelect('sistema')}
          title="Tema Según el Sistema Operativo"
          className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
            currentTheme === 'sistema'
              ? 'bg-[#146ef5] text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Full detailed button selector
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        type="button"
        onClick={() => handleSelect('claro')}
        className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
          currentTheme === 'claro'
            ? 'bg-[#146ef5]/10 border-[#146ef5] text-[#146ef5] font-bold shadow-xs'
            : 'bg-slate-50 dark:bg-[#161b22] border-slate-200 dark:border-[#222733] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-[#30363d]'
        }`}
      >
        <Sun className="w-4 h-4" />
        <span className="text-xs font-semibold">Claro</span>
        <span className="text-[10px] opacity-75 font-normal">Fondo Blanco</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelect('oscuro')}
        className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
          currentTheme === 'oscuro'
            ? 'bg-[#146ef5]/10 border-[#146ef5] text-[#146ef5] font-bold shadow-xs'
            : 'bg-slate-50 dark:bg-[#161b22] border-slate-200 dark:border-[#222733] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-[#30363d]'
        }`}
      >
        <Moon className="w-4 h-4" />
        <span className="text-xs font-semibold">Oscuro</span>
        <span className="text-[10px] opacity-75 font-normal">Fondo Noche</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelect('sistema')}
        className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
          currentTheme === 'sistema'
            ? 'bg-[#146ef5]/10 border-[#146ef5] text-[#146ef5] font-bold shadow-xs'
            : 'bg-slate-50 dark:bg-[#161b22] border-slate-200 dark:border-[#222733] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-[#30363d]'
        }`}
      >
        <Laptop className="w-4 h-4" />
        <span className="text-xs font-semibold">Sistema</span>
        <span className="text-[10px] opacity-75 font-normal">Automático</span>
      </button>
    </div>
  );
};
