import { create } from 'zustand';
import { authApi } from '../api/authApi';
import useCartStore from './cartStore';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

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

  login: async (email, password) => {
    const guestCartId = localStorage.getItem('fk_cart_id');
    const res = await authApi.login({ email, password, guestCartId });
    set({ user: res.data.user });
    localStorage.removeItem('fk_cart_id');
    return res.data.user;
  },

  signup: async (name, email, password) => {
    const res = await authApi.signup({ name, email, password });
    set({ user: res.data.user });
    return res.data.user;
  },

  logout: async () => {
    try { await authApi.logout(); } catch {}
    set({ user: null });
    localStorage.removeItem('fk_cart_id');
    useCartStore.getState().clearCart();
  },
}));

export default useAuthStore;
