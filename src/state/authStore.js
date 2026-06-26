import { create } from 'zustand';

/**
 * Auth store — Handles authentication and role-based access control (RBAC).
 * Also acts as a mock user database for Sprint 1 User Management.
 */

const INITIAL_USERS = [
  { id: 'u1', email: 'admin@tvs.com', password: 'admin123', role: 'Admin', name: 'System Admin', status: 'Active' },
  { id: 'u2', email: 'planner@tvs.com', password: 'admin123', role: 'Planner', name: 'John Planner', status: 'Active' },
  { id: 'u3', email: 'engineer@tvs.com', password: 'admin123', role: 'Production Engineer', name: 'Sarah Eng', status: 'Active' },
  { id: 'u4', email: 'manager@tvs.com', password: 'admin123', role: 'Plant Manager', name: 'Mike Boss', status: 'Active' },
  { id: 'u5', email: 'stores@tvs.com', password: 'admin123', role: 'Stores', name: 'Stores Desk', status: 'Active' },
  { id: 'u6', email: 'viewer@tvs.com', password: 'admin123', role: 'Viewer', name: 'Guest Viewer', status: 'Active' },
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

export const useAuthStore = create((set, get) => ({
  // Active session
  user: stored,
  isAuthenticated: !!stored,

  // Mock User Database for User Management Page
  systemUsers: INITIAL_USERS,

  login: (email, password, remember = false) => {
    const { systemUsers } = get();
    const found = systemUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.status === 'Active'
    );
    if (!found) {
      return { success: false, error: 'Invalid email/password or account disabled.' };
    }
    const user = { id: found.id, email: found.email, role: found.role, name: found.name };
    storeSession(user, remember);
    set({ user, isAuthenticated: true });
    return { success: true };
  },

  logout: () => {
    clearSession();
    set({ user: null, isAuthenticated: false });
  },

  // User Management Actions
  addUser: (newUser) => set((state) => ({
    systemUsers: [...state.systemUsers, { ...newUser, id: `u${Date.now()}` }]
  })),
  updateUser: (id, updates) => set((state) => ({
    systemUsers: state.systemUsers.map(u => u.id === id ? { ...u, ...updates } : u)
  })),
  deleteUser: (id) => set((state) => ({
    systemUsers: state.systemUsers.filter(u => u.id !== id)
  })),

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
