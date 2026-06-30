import { create } from 'zustand';
import api from '../services/api';

/**
 * Auth store — Handles authentication and role-based access control (RBAC).
 * Now uses the Express API for real user authentication and management.
 */

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

export const useAuthStore = create((set, get) => ({
  // Active session
  user: stored,
  isAuthenticated: !!stored,

  // User Database for User Management Page
  systemUsers: [],

  fetchUsers: async () => {
    try {
      const res = await api.get('/users');
      set({ systemUsers: res.data });
    } catch (e) {
      console.error(e);
    }
  },

  login: async (email, password, remember = false) => {
    try {
      const res = await api.post('/users/login', { email, password });
      if (res.data.success) {
        const user = res.data.user;
        storeSession(user, remember);
        set({ user, isAuthenticated: true });
        return { success: true };
      }
      return { success: false, error: 'Login failed.' };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Invalid email/password or account disabled.' };
    }
  },

  logout: () => {
    clearSession();
    set({ user: null, isAuthenticated: false });
  },

  // User Management Actions
  addUser: async (newUser) => {
    try {
      const res = await api.post('/users', { ...newUser, id: `u${Date.now()}` });
      set((state) => ({ systemUsers: [...state.systemUsers, res.data] }));
    } catch (e) { console.error(e); }
  },
  
  updateUser: async (id, updates) => {
    try {
      const res = await api.put(`/users/${id}`, updates);
      set((state) => ({ systemUsers: state.systemUsers.map(u => u.id === id ? res.data : u) }));
    } catch (e) { console.error(e); }
  },
  
  deleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}`);
      set((state) => ({ systemUsers: state.systemUsers.filter(u => u.id !== id) }));
    } catch (e) { console.error(e); }
  },

  // RBAC Helpers
  hasRole: (rolesAllowed) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === 'Admin') return true; // Admin has all access
    return rolesAllowed.includes(user.role);
  },

  canEditMasters: () => {
    const { user } = get();
    return user?.role === 'Admin' || user?.role === 'Planner' || user?.role === 'Production Engineer';
  },

  canApprovePlan: () => {
    const { user } = get();
    return user?.role === 'Admin' || user?.role === 'Production Engineer';
  },

  canLockPlan: () => {
    const { user } = get();
    return user?.role === 'Admin' || user?.role === 'Plant Manager';
  }
}));
