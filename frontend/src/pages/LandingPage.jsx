import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import ProductCard from '../components/product/ProductCard';

export default function LandingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          productApi.getCategories(),
          productApi.getProducts({ limit: 20 })
        ]);
        setCategories(catRes.data || []);
        setProducts(prodRes.data?.products || []);
      } catch (err) {
        console.error('Failed to load landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const bestSellers = products.slice(0, 8);
  const newArrivals = products.slice(8, 16);

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', minHeight: '400px' }}>
        <div style={{ fontSize: '16px', color: 'var(--fk-text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5' }}>
      {/* Hero Banner with Image */}
      <div style={{
        background: '#fff',
        padding: '16px',
        marginBottom: '24px',
        borderRadius: '4px'
      }}>
        <div style={{
          width: '100%',
          height: '300px',
          background: 'linear-gradient(135deg, #2874F1 0%, #1d4ed8 100%)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '24px'
        }}>
          Your Featured Deals Start Here
        </div>
      </div>

      {/* Category Showcase */}
      <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '0 16px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--fk-text-primary)' }}>
          Shop by Category
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '8px',
          background: '#fff',
          padding: '16px',
          borderRadius: '4px'
        }}>
          {categories.slice(0, 10).map(cat => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              style={{
                background: '#fff',
                padding: '12px',
                borderRadius: '4px',
                textAlign: 'center',
                cursor: 'pointer',
                border: '1px solid #f0f0f0',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = '1px solid #bbb';
                e.currentTarget.style.background = '#fafafa';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid #f0f0f0';
                e.currentTarget.style.background = '#fff';
              }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 8px',
                background: `linear-gradient(135deg, ${getCategoryColor(cat.name)} 0%, ${getCategoryColorLight(cat.name)} 100%)`,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: '#fff'
              }}>
                {getCategoryIcon(cat.name)}
              </div>
              <h3 style={{ fontSize: '12px', fontWeight: 600, margin: '0', color: 'var(--fk-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cat.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Best Sellers Section */}
      <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '0 16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--fk-text-primary)', borderBottom: '2px solid #2874F1', paddingBottom: '12px' }}>
            Best Sellers
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px'
          }}>
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* New Arrivals Section */}
      <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '0 16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--fk-text-primary)', borderBottom: '2px solid #2874F1', paddingBottom: '12px' }}>
            New Arrivals
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px'
          }}>
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {[
            {
              title: 'Free Delivery',
              desc: 'On orders above ₹499',
              icon: '�',
              bgColor: '#e7f5ff'
            },
            {
              title: 'Secure Payment',
              desc: '100% safe transactions',
              icon: '�️',
              bgColor: '#f0fdf4'
            },
            {
              title: '100% Authentic',
              desc: 'Genuine products only',
              icon: '✓',
              bgColor: '#fef3c7'
            },
            {
              title: 'Easy Returns',
              desc: '7-day return policy',
              icon: '↩️',
              bgColor: '#fce7f3'
            }
          ].map((feature, i) => (
            <div key={i} style={{
              textAlign: 'center',
              padding: '16px',
              background: feature.bgColor,
              borderRadius: '4px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--fk-text-primary)' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--fk-text-secondary)', margin: 0 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getCategoryEmoji(categoryName) {
  const emojiMap = {
    Electronics: '📱',
    Fashion: '👔',
    Home: '🏠',
    Beauty: '💄',
    Books: '📚',
    Sports: '⚽',
    Toys: '🎮',
    Grocery: '🛒',
    Appliances: '🍳'
  };
  return emojiMap[categoryName] || '📦';
}

function getCategoryIcon(categoryName) {
  const iconMap = {
    Electronics: '📱',
    Fashion: '👕',
    Home: '🏠',
    Beauty: '💅',
    Books: '📖',
    Sports: '🏃',
    Toys: '🧸',
    Grocery: '🥬',
    Appliances: '🍽️'
  };
  return iconMap[categoryName] || '📦';
}

function getCategoryColor(categoryName) {
  const colorMap = {
    Electronics: '#FF9F43',
    Fashion: '#FF6B9D',
    Home: '#54A0FF',
    Beauty: '#EE5A6F',
    Books: '#48DBFB',
    Sports: '#1DD1A1',
    Toys: '#5F27CD',
    Grocery: '#00D2D3',
    Appliances: '#FFA502'
  };
  return colorMap[categoryName] || '#2874F1';
}

function getCategoryColorLight(categoryName) {
  const colorMap = {
    Electronics: '#FFB366',
    Fashion: '#FF9FBE',
    Home: '#7FB3FF',
    Beauty: '#FF99A8',
    Books: '#8EDAFF',
    Sports: '#5EDDA8',
    Toys: '#9D5FFF',
    Grocery: '#4DD5D5',
    Appliances: '#FFB833'
  };
  return colorMap[categoryName] || '#5A9FD8';
}
