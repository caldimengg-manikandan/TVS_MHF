import { create } from 'zustand';

/**
 * Theme store — dark/light mode toggle.
 * Persists preference to localStorage.
 */

function getInitialTheme() {
  try {
    const stored = localStorage.getItem('tvs-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* ignore */ }
  // Default to dark
  return 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('tvs-theme', theme);
  } catch { /* ignore */ }
}

// Apply on load
const initial = getInitialTheme();
applyTheme(initial);

export const useThemeStore = create((set) => ({
  theme: initial,

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return { theme: next };
    }),

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
