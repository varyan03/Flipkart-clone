import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import { CartIcon, UserIcon, HeartIcon, OrdersIcon, LogoutIcon, ChevronDownIcon, PlaneIcon, LocationIcon, SearchIcon, HomeIcon } from '../icons/Icons';

export default function HomeNavbar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = '185131';

  const itemCount = useCartStore(state => state.getItemCount)();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="home-navbar">
      <div className="home-navbar-desktop hide-on-mobile" style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        gap: '16px',
        maxWidth: '1248px',
        margin: '0 auto'
      }}>

        {/* Logo */}
        <div 
          onClick={() => navigate('/')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}
        >
          <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg" alt="Flipkart" style={{ height: '24px' }} />
        </div>

        {/* Travel Badge (Optional) */}
        <div style={{
          background: '#f5f5f5',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#000',
          fontWeight: 400,
          cursor: 'pointer',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <PlaneIcon />
          Travel
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          background: '#f5f5f5',
          borderRadius: '4px',
          border: '2px solid #f5f5f5',
          transition: 'border 0.2s',
          cursor: 'text',
          minWidth: '300px'
        }}
          onFocus={e => e.currentTarget.style.border = '2px solid #2874F1'}
          onBlur={e => e.currentTarget.style.border = '2px solid #f5f5f5'}
        >
          <input
            type="text"
            placeholder="Search for Products, Brands and More"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              padding: '8px 12px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button type="submit" style={{
            background: 'none',
            border: 'none',
            padding: '8px 12px',
            cursor: 'pointer',
            color: '#878787'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </form>

        {/* Location Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          color: '#2874F1',
          cursor: 'pointer',
          flexShrink: 0,
          whiteSpace: 'nowrap'
        }}>
          <span style={{ color: '#000', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <LocationIcon /> {location}
          </span>
          <span style={{ color: '#2874F1', fontWeight: 600, fontSize: '11px' }}>Select delivery location</span>
          <ChevronDownIcon />
        </div>

        {/* Right Section: Login/User, More, Cart */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexShrink: 0,
          whiteSpace: 'nowrap'
        }}>

          {/* Login / User Menu */}
          <div style={{ position: 'relative' }}
            onMouseEnter={() => setUserMenuOpen(true)}
            onMouseLeave={() => setUserMenuOpen(false)}
          >
            {user ? (
              <button style={{
                background: userMenuOpen ? '#2874F1' : 'transparent',
                border: 'none',
                color: userMenuOpen ? '#fff' : '#000',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 400,
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}>
                <UserIcon /> {user.name.split(' ')[0]} <ChevronDownIcon style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                style={{
                background: userMenuOpen ? '#2874F1' : 'transparent',
                border: 'none',
                color: userMenuOpen ? '#fff' : '#000',
                fontWeight: 400,
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
              >
                <UserIcon /> Login <ChevronDownIcon style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
            )}

            {userMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                paddingTop: '8px',
                zIndex: 200,
              }}>
                <div style={{
                  background: '#fff',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  minWidth: '240px',
                  padding: '8px 0',
                  color: '#000',
                  overflow: 'hidden'
                }}>
                  {!user && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#000' }}>New customer?</span>
                      <Link to="/signup" style={{ color: '#2874F1', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>Sign Up</Link>
                    </div>
                  )}

                  {[
                    { label: 'Orders', iconNode: <OrdersIcon style={{ width: '18px', height: '18px'}} />, to: '/orders' },
                    { label: 'Wishlist', iconNode: <HeartIcon style={{ width: '18px', height: '18px'}} />, to: '/wishlist' },
                  ].map(({ label, iconNode, to }) => (
                    <Link key={label} to={user ? to : '/login'} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: '#000',
                      textDecoration: 'none',
                      fontWeight: 400,
                      transition: 'background 0.2s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {iconNode}
                      {label}
                    </Link>
                  ))}
                  {user && (
                    <button onClick={handleLogout} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: '#E74C3C',
                      background: 'none',
                      border: 'none',
                      borderTop: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      fontWeight: 400,
                      transition: 'background 0.2s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FFF3F3'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogoutIcon style={{ width: '18px', height: '18px' }} />
                      Logout
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* More Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#2874F1',
            fontWeight: 500,
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            More <ChevronDownIcon />
          </div>

          {/* Cart */}
          <div
            onClick={() => navigate('/cart')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#2874F1',
              fontWeight: 500,
              fontSize: '14px',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <CartIcon />
            Cart
            {itemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#E74C3C',
                color: '#fff',
                fontSize: '10px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {itemCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="home-navbar-mobile mobile-only">
        <div className="home-mobile-chip-row">
          <button className="home-mobile-chip home-mobile-chip--brand" onClick={() => navigate('/')}>
            Flipkart
          </button>
          <button className="home-mobile-chip home-mobile-chip--address">
            <LocationIcon />
            HOME House Number 149, ward no
          </button>
        </div>

        <form onSubmit={handleSearch} className="home-mobile-search-form">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search for Products, Brands and More"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="home-mobile-search-input"
          />
          <button type="submit" className="home-mobile-search-submit" aria-label="Search">
            <SearchIcon />
          </button>
        </form>

        <div className="home-mobile-spacer" />

        <div className="home-mobile-bottom-nav">
          <button className="home-mobile-bottom-item is-active" onClick={() => navigate('/')}>
            <HomeIcon />
            <span>Home</span>
          </button>

          <button className="home-mobile-bottom-item" onClick={() => navigate('/products')}>
            <PlayIcon />
            <span>Play</span>
          </button>

          <button className="home-mobile-bottom-item" onClick={() => navigate('/products')}>
            <CategoriesIcon />
            <span>Categories</span>
          </button>

          <button className="home-mobile-bottom-item" onClick={() => navigate(user ? '/orders' : '/login')}>
            <UserIcon />
            <span>Account</span>
          </button>

          <button className="home-mobile-bottom-item home-mobile-bottom-item--cart" onClick={() => navigate('/cart')}>
            <CartIcon />
            <span>Cart</span>
            {itemCount > 0 && <span className="home-mobile-cart-badge">{itemCount}</span>}
          </button>
        </div>

      </div>
    </nav>
  );
}

const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <polygon points="10,8 17,12 10,16" fill="currentColor" stroke="none" />
  </svg>
);

const CategoriesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);
