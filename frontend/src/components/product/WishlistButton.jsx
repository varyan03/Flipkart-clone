import useAuthStore from '../../store/authStore';
import useWishlistStore from '../../store/wishlistStore';
import { useNavigate } from 'react-router-dom';
import { HeartIcon } from '../icons/Icons';

/**
 * Heart icon button. Fills when wishlisted.
 * Simplified design to match Flipkart reference image.
 */
export default function WishlistButton({ productId, style = {} }) {
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
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: wishlisted ? '#ff4343' : '#c2c2c2',
        transition: 'all 0.2s ease',
        ...style
      }}
      onMouseEnter={e => {
        if (!wishlisted) e.currentTarget.style.color = '#ff4343';
      }}
      onMouseLeave={e => {
        if (!wishlisted) e.currentTarget.style.color = '#c2c2c2';
      }}
    >
      <HeartIcon fill={wishlisted} />
    </button>
  );
}
