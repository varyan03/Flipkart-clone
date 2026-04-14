import { create } from 'zustand';
import { cartApi } from '../api/cartApi';

const useCartStore = create((set, get) => ({
  cartId: localStorage.getItem('fk_cart_id') || null,
  items: [],
  loading: false,

  initCart: async () => {
    try {
      let { cartId } = get();
      if (!cartId) {
        const res = await cartApi.createCart();
        cartId = res.data.cartId;
        localStorage.setItem('fk_cart_id', cartId);
        set({ cartId });
      }
      const cart = await cartApi.getCart(cartId);
      set({ items: cart.data.items });
    } catch (e) {
      console.error('initCart error:', e);
      localStorage.removeItem('fk_cart_id');
      set({ cartId: null, items: [] });
    }
  },

  addItem: async (productId, quantity = 1) => {
    let { cartId } = get();
    if (!cartId) {
      const res = await cartApi.createCart();
      cartId = res.data.cartId;
      localStorage.setItem('fk_cart_id', cartId);
      set({ cartId });
    }
    await cartApi.addItem(cartId, { productId, quantity });
    await get()._refresh();
  },

  updateQuantity: async (productId, quantity) => {
    const previousItems = get().items;
    set({ items: previousItems.map(i => i.productId === productId ? { ...i, quantity } : i) });
    try {
      await cartApi.updateItem(get().cartId, productId, { quantity });
      await get()._refresh();
    } catch (err) {
      set({ items: previousItems });
    }
  },

  removeItem: async (productId) => {
    const previousItems = get().items;
    set({ items: previousItems.filter(i => i.productId !== productId) });
    try {
      await cartApi.removeItem(get().cartId, productId);
      await get()._refresh();
    } catch (err) {
      set({ items: previousItems });
    }
  },

  clearCart: () => {
    localStorage.removeItem('fk_cart_id');
    set({ cartId: null, items: [] });
  },

  _refresh: async () => {
    try {
      const cart = await cartApi.getCart(get().cartId);
      set({ items: cart.data.items });
    } catch (e) {
      console.error('_refresh error:', e);
    }
  },

  // Computed values as plain functions — Zustand does NOT support JS getter syntax
  getItemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
  getSubtotal: () => get().items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0),
  getSavings: () => get().items.reduce((s, i) => s + (Number(i.product.mrp) - Number(i.product.price)) * i.quantity, 0),
}));

export default useCartStore;
