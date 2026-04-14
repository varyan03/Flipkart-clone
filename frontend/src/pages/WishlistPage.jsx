import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useWishlistStore from '../store/wishlistStore';
import ProductCard from '../components/product/ProductCard';

export default function WishlistPage() {
  const items = useWishlistStore(state => state.items);
  const loading = useWishlistStore(state => state.loading);
  const fetchWishlist = useWishlistStore(state => state.fetchWishlist);

  useEffect(() => { fetchWishlist(); }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div style={{ fontSize: '14px', color: 'var(--fk-text-secondary)' }}>Loading wishlist...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '1248px', margin: '32px auto', textAlign: 'center', padding: '64px 16px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤍</div>
        <h2 style={{ fontWeight: 500, fontSize: '18px', marginBottom: '8px' }}>Your Wishlist is Empty</h2>
        <p style={{ color: 'var(--fk-text-secondary)', marginBottom: '24px' }}>
          Save items that you like in your wishlist. Review them anytime and easily move them to the cart.
        </p>
        <Link
          to="/products"
          style={{ background: 'var(--fk-blue)', color: '#fff', padding: '12px 32px', borderRadius: '2px', fontWeight: 500 }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1248px', margin: '16px auto', padding: '0 16px' }}>
      <div style={{ background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', marginBottom: '16px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>
          My Wishlist ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {items.map(item => (
          <ProductCard key={item.id} product={item.product} />
        ))}
      </div>
    </div>
  );
}
