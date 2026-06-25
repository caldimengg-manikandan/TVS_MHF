import { create } from 'zustand';

/**
 * Auth store — client-side gate (Option A).
 * Structured so login() can be swapped for an API call later (Option B).
 */

// Hardcoded credentials for Option A demo
const USERS = [
  { email: 'admin@tvs.com',  password: 'admin123',  role: 'editor', name: 'Admin' },
  { email: 'viewer@tvs.com', password: 'viewer123', role: 'viewer', name: 'Viewer' },
];

function getStoredSession() {
  try {
    const s = sessionStorage.getItem('tvs-auth');
    if (s) return JSON.parse(s);
    const l = localStorage.getItem('tvs-auth');
    if (l) return JSON.parse(l);
  } catch { /* ignore */ }
  return null;
}

function storeSession(user, remember) {
  const data = JSON.stringify(user);
  if (remember) {
    localStorage.setItem('tvs-auth', data);
  } else {
    sessionStorage.setItem('tvs-auth', data);
  }
}

function clearSession() {
  sessionStorage.removeItem('tvs-auth');
  localStorage.removeItem('tvs-auth');
}

const stored = getStoredSession();

export const useAuthStore = create((set) => ({
  user: stored,  // { email, role, name } or null
  isAuthenticated: !!stored,

  login: (email, password, remember = false) => {
    const found = USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { success: false, error: 'Invalid email or password.' };
    }
    const user = { email: found.email, role: found.role, name: found.name };
    storeSession(user, remember);
    set({ user, isAuthenticated: true });
    return { success: true };
  },

  logout: () => {
    clearSession();
    set({ user: null, isAuthenticated: false });
  },

  // Helper to check role
  isEditor: () => {
    const state = useAuthStore.getState();
    return state.user?.role === 'editor';
  },
}));
