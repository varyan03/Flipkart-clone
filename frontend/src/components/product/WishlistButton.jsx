import useAuthStore from '../../store/authStore';
import useWishlistStore from '../../store/wishlistStore';
import { useNavigate } from 'react-router-dom';

/**
 * Heart icon button. Fills when wishlisted.
 * Redirects to /login if not authenticated.
 * size: 'sm' (on cards) | 'lg' (on detail page)
 */
export default function WishlistButton({ productId, size = 'sm' }) {
  const user = useAuthStore(state => state.user);
  const isWishlisted = useWishlistStore(state => state.isWishlisted);
  const toggle = useWishlistStore(state => state.toggle);
  const navigate = useNavigate();
  const wishlisted = isWishlisted(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      await toggle(productId);
    } catch {
      // silently fail — store already reverts
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`wishlist-btn wishlist-btn--${size}`}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      title={wishlisted ? 'Remove from wishlist' : 'Save for later'}
    >
      {wishlisted ? '❤️' : '🤍'}
    </button>
  );
}
