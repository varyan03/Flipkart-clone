import { create } from 'zustand';
import { wishlistApi } from '../api/wishlistApi';

/**
 * Global wishlist state store using Zustand.
 * Manages the collection of user-favorited products and provides
 * optimistic UI updates for toggling wishlist status.
 */
const useWishlistStore = create((set, get) => ({
  items: [],             // Array of wishlist items with nested product data
  wishlistedIds: new Set(), // Set of product IDs for O(1) membership checks
  loading: false,

  /** 
   * Fetches the user's wishlist from the API and synchronizes the local ID set.
   */
  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const res = await wishlistApi.getWishlist();
      const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      set({
        items,
        wishlistedIds: new Set(items.map(i => i.product?.id || i.productId)),
        loading: false
      });
    } catch {
      set({ loading: false });
    }
  },

  /** 
   * Toggles a product's presence in the wishlist with an optimistic UI revert pattern.
   * 
   * @param {number|string} productId - ID of the product to toggle
   */
  toggle: async (productId) => {
    const { wishlistedIds } = get();
    const isWishlisted = wishlistedIds.has(productId);

    // Optimistic update
    const newSet = new Set(wishlistedIds);
    isWishlisted ? newSet.delete(productId) : newSet.add(productId);
    set({ wishlistedIds: newSet });

    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(productId);
        set({ items: get().items.filter(i => (i.product?.id || i.productId) !== productId) });
      } else {
        await wishlistApi.addToWishlist(productId);
        await get().fetchWishlist();
      }
    } catch (err) {
      set({ wishlistedIds }); // revert on failure
      throw err;
    }
  },

  /** 
   * Helper to check if a product is in the wishlist.
   * 
   * @param {number|string} productId
   * @returns {boolean}
   */
  isWishlisted: (productId) => get().wishlistedIds.has(productId),
}));

export default useWishlistStore;
