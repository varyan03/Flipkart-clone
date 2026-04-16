import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import BannerCarousel from '../components/layout/BannerCarousel';

export default function LandingPage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPrimaryImage = (product) => {
    const raw = product?.images;
    if (Array.isArray(raw)) return raw[0] || '';
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed[0] || '';
      } catch {
        return raw;
      }
      return raw;
    }
    return '';
  };

  const topSelectionProducts = featuredProducts.slice(0, 4);
  const bestDealProducts = featuredProducts.slice(0, 4);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch specifically electronics for the featured deal section
        const response = await productApi.getProducts({ category: 'electronics', limit: 10 });
        setFeaturedProducts(response.data?.products || []);
      } catch (err) {
        console.error('Failed to load featured deals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', minHeight: '400px' }}>
        <div style={{ fontSize: '16px', color: 'var(--fk-text-secondary)' }}>Loading Featured Deals...</div>
      </div>
    );
  }

  const renderSelectionSection = (title, products, ctaLink) => (
    <section className="landing-top-selection-wrap">
      <div className="landing-top-selection-head">
        <h2>{title}</h2>
        <Link to={ctaLink} className="landing-top-selection-cta" aria-label={`View ${title}`}>
          →
        </Link>
      </div>

      <div className="landing-top-selection-grid">
        {products.map((product) => {
          const image = getPrimaryImage(product);
          const discount = product?.mrp && product?.price
            ? Math.round((1 - product.price / product.mrp) * 100)
            : null;

          return (
            <article key={product.id} className="landing-top-selection-card">
              <Link to={`/product/${product.id}`} className="landing-top-selection-link">
                <div className="landing-top-selection-image-box">
                  <img src={image} alt={product.name} loading="lazy" />
                </div>
                <p className="landing-top-selection-brand">{product.brand || 'Featured'}</p>
                <h3 className="landing-top-selection-title line-clamp-2">{product.name}</h3>
                <p className="landing-top-selection-offer">
                  {discount && discount > 0 ? `${discount}% Off` : 'Special offer'}
                </p>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="landing-page-root" style={{ background: '#f1f3f6', minHeight: '100vh', padding: '10px 0' }}>
      
      {/* Centered Banner Area wrapped in max-width container */}
      <div style={{ maxWidth: '1248px', margin: '0 auto 10px', padding: '0 8px' }}>
        <BannerCarousel />
      </div>

      {/* Best Deals (styled same as Top Selection) */}
      {bestDealProducts.length > 0 && renderSelectionSection('Best Deals on Electronics', bestDealProducts, '/products?category=electronics')}

      {/* Top Selection Section (reference-inspired) */}
      {topSelectionProducts.length > 0 && (
        renderSelectionSection('Top Selection', topSelectionProducts, '/products?category=electronics')
      )}

      {/* Trust & Features Section */}
      <div style={{ maxWidth: '1248px', margin: '30px auto', padding: '0 8px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {[
            { 
              title: 'Top Brand Selection', 
              desc: 'Shop from PUMA, Sony, Samsung and more', 
              icon: '🏷️'
            },
            { 
              title: 'Secure Shopping', 
              desc: '100% security with protected payments', 
              icon: '🛡️'
            },
            { 
              title: 'Fast & Free Delivery', 
              desc: 'On millions of products every day', 
              icon: '🚚'
            }
          ].map((feature, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              background: '#fff',
              borderRadius: '2px',
              boxShadow: '0 1px 1px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '28px' }}>{feature.icon}</div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0', color: '#212121' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '12px', color: '#878787', margin: 0 }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
