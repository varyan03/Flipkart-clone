import { useEffect, useState } from 'react';
import { productApi } from '../api/productApi';
import ProductCarousel from '../components/product/ProductCarousel';
import BannerCarousel from '../components/layout/BannerCarousel';

export default function LandingPage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ background: '#f1f3f6', minHeight: '100vh', padding: '10px 0' }}>
      
      {/* Centered Banner Area wrapped in max-width container */}
      <div style={{ maxWidth: '1248px', margin: '0 auto 10px', padding: '0 8px' }}>
        <BannerCarousel />
      </div>

      {/* Single Featured Deals Carousel */}
      <div style={{ padding: '0 8px' }}>
        <ProductCarousel 
          title="Best Deals on Electronics" 
          products={featuredProducts} 
          categorySlug="all"
          variant="deals"
          isStatic={true}
        />
      </div>

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
