import { AppTheme } from '../types';

const THEME_STORAGE_KEY = 'conciliapyme_theme_mode';

export class ThemeService {
  private static currentTheme: AppTheme = 'oscuro';
  private static listeners: ((theme: AppTheme, isDark: boolean) => void)[] = [];
  private static systemMediaQuery: MediaQueryList | null = null;

  public static init(): void {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null;
    if (saved && (saved === 'claro' || saved === 'oscuro' || saved === 'sistema')) {
      this.currentTheme = saved;
    } else {
      this.currentTheme = 'oscuro';
    }

    if (typeof window !== 'undefined') {
      this.systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemMediaQuery.addEventListener('change', () => {
        if (this.currentTheme === 'sistema') {
          this.applyTheme(this.currentTheme);
        }
      });
    }

    this.applyTheme(this.currentTheme);
  }

  public static initTheme(): void {
    this.init();
  }

  public static getTheme(): AppTheme {
    return this.currentTheme;
  }

  public static isDarkMode(): boolean {
    if (this.currentTheme === 'oscuro') return true;
    if (this.currentTheme === 'claro') return false;
    if (typeof window !== 'undefined' && this.systemMediaQuery) {
      return this.systemMediaQuery.matches;
    }
    return true;
  }

  public static setTheme(theme: AppTheme): void {
    this.currentTheme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  private static applyTheme(theme: AppTheme): void {
    const isDark = this.isDarkMode();
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;

      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
        if (body) {
          body.classList.add('dark');
          body.classList.remove('light');
          body.setAttribute('data-theme', 'dark');
        }
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
        if (body) {
          body.classList.remove('dark');
          body.classList.add('light');
          body.setAttribute('data-theme', 'light');
        }
      }
    }
    this.notify(theme, isDark);
  }

  public static subscribe(listener: (theme: AppTheme, isDark: boolean) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentTheme, this.isDarkMode());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify(theme: AppTheme, isDark: boolean): void {
    this.listeners.forEach((l) => l(theme, isDark));
  }
}
