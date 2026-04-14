import { create } from 'zustand';
import { wishlistApi } from '../api/wishlistApi';

const useWishlistStore = create((set, get) => ({
  items: [],
  wishlistedIds: new Set(),
  loading: false,

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
      set({ wishlistedIds }); // revert
      throw err;
    }
  },

  isWishlisted: (productId) => get().wishlistedIds.has(productId),
}));

export default useWishlistStore;
