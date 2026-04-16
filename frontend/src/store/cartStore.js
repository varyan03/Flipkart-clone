import { create } from 'zustand';
import { cartApi } from '../api/cartApi';

/**
 * Global shopping cart state store using Zustand.
 * Manages cart persistence (UUID in localStorage), item management,
 * and optimistic UI updates for quantity changes.
 */
const useCartStore = create((set, get) => ({
  cartId: localStorage.getItem('fk_cart_id') || null, // Shared UUID for guest/user sessions
  items: [],   // Array of cart items with product details
  loading: false,

  /** 
   * Initializes the cart. Creates a new cart on the backend if none exists
   * in localStorage, otherwise fetches existing items.
   */
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

  /** 
   * Adds a product to the cart. Creates the cart first if it doesn't exist.
   * 
   * @param {number|string} productId
   * @param {number} [quantity=1]
   */
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

  /** 
   * Updates an item's quantity with an optimistic UI revert pattern.
   * 
   * @param {number|string} productId
   * @param {number} quantity
   */
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

  /** 
   * Removes an item with an optimistic UI revert pattern.
   * 
   * @param {number|string} productId
   */
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

  /** 
   * Clears the cart local state and identifier.
   */
  clearCart: () => {
    localStorage.removeItem('fk_cart_id');
    set({ cartId: null, items: [] });
  },

  /** 
   * Private helper to sync frontend state with backend data.
   */
  _refresh: async () => {
    try {
      const cart = await cartApi.getCart(get().cartId);
      set({ items: cart.data.items });
    } catch (e) {
      console.error('_refresh error:', e);
    }
  },

  /** Calculates total unique and quantity-weighted items */
  getItemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
  
  /** Calculates the total price after individual discounts */
  getSubtotal: () => get().items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0),
  
  /** Calculates the total savings (MRP - Sale Price) */
  getSavings: () => get().items.reduce((s, i) => s + (Number(i.product.mrp) - Number(i.product.price)) * i.quantity, 0),
}));

export default useCartStore;
