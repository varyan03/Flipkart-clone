import { create } from 'zustand';
import { authApi } from '../api/authApi';
import useCartStore from './cartStore';

/**
 * Global authentication state store using Zustand.
 * Manages user session, login, signup, and logout logic.
 */
const useAuthStore = create((set, get) => ({
  user: null,    // { id, name, email } or null
  loading: true, // true until the initial session check completes

  /** 
   * Verifies if a valid session exists via the me() endpoint. 
   * Attempts a silent refresh if the initial check fails.
   */
  checkSession: async () => {
    try {
      const res = await authApi.me();
      set({ user: res.data.user, loading: false });
    } catch (err) {
      // Try silent refresh
      try {
        await authApi.refresh();
        const res = await authApi.me();
        set({ user: res.data.user, loading: false });
      } catch {
        set({ user: null, loading: false });
      }
    }
  },

  /** 
   * Authenticates a user and handles guest cart merging.
   * 
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    const guestCartId = localStorage.getItem('fk_cart_id');
    const res = await authApi.login({ email, password, guestCartId });
    set({ user: res.data.user });
    localStorage.removeItem('fk_cart_id');
    return res.data.user;
  },

  /** 
   * Registers a new user.
   * 
   * @param {string} name
   * @param {string} email
   * @param {string} password
   */
  signup: async (name, email, password) => {
    const res = await authApi.signup({ name, email, password });
    set({ user: res.data.user });
    return res.data.user;
  },

  /** 
   * Destroys the current session and clears local cart data.
   */
  logout: async () => {
    try { await authApi.logout(); } catch {}
    set({ user: null });
    localStorage.removeItem('fk_cart_id');
    useCartStore.getState().clearCart();
  },
}));

export default useAuthStore;
