import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const items = useCartStore(state => state.items);
  const getItemCount = useCartStore(state => state.getItemCount);
  const itemCount = getItemCount();

  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav style={{
      height: '64px',
      background: 'var(--fk-blue-gradient)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', maxWidth: '1248px', width: '100%', gap: '20px' }}>

        {/* Logo */}
        <div style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', flexShrink: 0 }} onClick={() => navigate('/')}>
          <span style={{ color: '#fff', fontSize: '20px', fontStyle: 'italic', fontWeight: 'bold' }}>Flipkart</span>
          <span style={{ color: 'var(--fk-yellow)', fontStyle: 'italic', fontSize: '11px', display: 'flex', alignItems: 'center' }}>
            Explore <span style={{ color: '#fff', fontWeight: 'bold', marginLeft: '2px' }}>Plus</span>
          </span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, maxWidth: '560px', height: '36px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search for Products, Brands and More"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '0 16px', border: 'none',
              borderRadius: '2px', outline: 'none', fontSize: '14px'
            }}
          />
          <button type="submit" style={{
            position: 'absolute', right: 0, top: 0, height: '100%', width: '40px',
            background: 'none', border: 'none', color: 'var(--fk-blue)', cursor: 'pointer'
          }}>
            <svg width="20" height="20" viewBox="0 0 17 18" xmlns="http://www.w3.org/2000/svg">
              <g fill="#2874F1" fillRule="evenodd">
                <path d="m11.618 9.897l4.225 4.212c.092.092.101.232.02.313l-1.465 1.46c-.081.081-.221.072-.314-.02l-4.216-4.203"></path>
                <path d="m6.486 10.901c-2.42 0-4.381-1.956-4.381-4.368 0-2.413 1.961-4.369 4.381-4.369 2.42 0 4.381 1.956 4.381 4.369 0 2.413-1.961 4.368-4.381 4.368m0-10.835c-3.582 0-6.486 2.895-6.486 6.467 0 3.572 2.904 6.467 6.486 6.467 3.582 0 6.486-2.895 6.486-6.467 0-3.572-2.904-6.467-6.486-6.467"></path>
              </g>
            </svg>
          </button>
        </form>

        {/* Right nav items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto', flexShrink: 0 }}>

          {/* Auth section */}
          {user ? (
            <div style={{ position: 'relative' }}
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <button style={{
                background: 'none', border: 'none', color: '#fff',
                fontWeight: 500, fontSize: '15px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                {user.name.split(' ')[0]} <span>▾</span>
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0,
                  background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  borderRadius: '4px', minWidth: '180px', zIndex: 200,
                  padding: '8px 0', marginTop: '8px'
                }}>
                  {[
                    { label: '📦 My Orders', to: '/orders' },
                    { label: '🤍 Wishlist', to: '/wishlist' },
                  ].map(({ label, to }) => (
                    <Link key={to} to={to} style={{
                      display: 'block', padding: '12px 20px', fontSize: '14px',
                      color: 'var(--fk-text-primary)', borderBottom: '1px solid #f0f0f0'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >{label}</Link>
                  ))}
                  <button onClick={handleLogout} style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '12px 20px', fontSize: '14px', color: 'var(--fk-red)',
                    background: 'none', border: 'none', cursor: 'pointer'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff0f0'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: '#fff', color: 'var(--fk-blue)',
                padding: '4px 30px', height: '32px',
                border: '1px solid #dbdbdb', borderRadius: '2px',
                fontWeight: 500, fontSize: '15px'
              }}
            >
              Login
            </button>
          )}

          {/* More */}
          <div style={{ color: '#fff', fontWeight: 500, fontSize: '15px', cursor: 'pointer' }}>
            More ▾
          </div>

          {/* Cart */}
          <div
            onClick={() => navigate('/cart')}
            style={{ color: '#fff', fontWeight: 500, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill="#fff" d="M15.32 2.405H4.887C3 2.405 2.46.805 2.46.805L2.257.21C2.208.085 2.083 0 1.946 0H.336C.1 0-.064.24.024.46l.644 1.945L3.11 9.767c.047.137.175.23.32.23h8.418l-.493 1.958H3.768l.002.003c-.017 0-.033-.003-.05-.003-1.06 0-1.92.86-1.92 1.92s.86 1.92 1.92 1.92c.99 0 1.805-.75 1.91-1.712l5.55.076c.12.922.91 1.636 1.867 1.636 1.04 0 1.885-.844 1.885-1.885 0-.866-.584-1.593-1.38-1.814l2.423-8.832c.12-.433-.206-.86-.655-.86" fillRule="evenodd"></path>
              </svg>
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-8px', right: '-12px',
                  background: 'var(--fk-red)', color: '#fff',
                  fontSize: '11px', padding: '1px 5px', borderRadius: '10px',
                  fontWeight: 'bold', border: '1px solid #fff'
                }}>
                  {itemCount}
                </span>
              )}
            </div>
            Cart
          </div>

        </div>
      </div>
    </nav>
  );
}
