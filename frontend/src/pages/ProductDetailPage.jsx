import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import useCartStore from '../../store/cartStore';
import ImageCarousel from '../../components/product/ImageCarousel';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    productApi.getProductById(id)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>;
  if (!product) return <div style={{ padding: '24px', textAlign: 'center' }}>Product not found</div>;

  let images = [];
  try { images = JSON.parse(product.images); } catch(e) { images = [product.images]; }

  let specs = {};
  try { specs = JSON.parse(product.specs); } catch(e) {}

  const discountPercent = Math.round((1 - product.price / product.mrp) * 100);

  const handleAddToCart = async () => {
    setAdding(true);
    await addItem(product.id);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    await addItem(product.id);
    navigate('/cart');
  };

  return (
    <div style={{ maxWidth: '1248px', margin: '16px auto', background: '#fff', display: 'flex', padding: '24px', gap: '32px' }}>
      
      {/* Left Column (Images & Actions) */}
      <div style={{ width: '40%' }}>
        <ImageCarousel images={images} />
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button 
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            style={{
              flex: 1, height: '50px', background: added ? 'var(--fk-green)' : 'var(--fk-orange)',
              color: '#fff', border: 'none', borderRadius: '2px',
              fontSize: '16px', fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {adding ? 'Adding...' : added ? '✓ Added to Cart' : '🛒 ADD TO CART'}
          </button>
          
          <button 
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            style={{
              flex: 1, height: '50px', background: 'var(--fk-buy-now)',
              color: '#fff', border: 'none', borderRadius: '2px',
              fontSize: '16px', fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            ⚡ BUY NOW
          </button>
        </div>
      </div>

      {/* Right Column (Details) */}
      <div style={{ flex: 1 }}>
        <div style={{ color: 'var(--fk-text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
          Home {'>'} {product.category?.name} {'>'} {product.brand}
        </div>
        
        <h1 style={{ fontSize: '18px', fontWeight: 400, margin: '0 0 8px 0', color: 'var(--fk-text-primary)' }}>
          {product.name}
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span className="rating-badge rating-high">{product.rating} ★</span>
          <span style={{ color: 'var(--fk-text-secondary)' }}>
            {product.ratingCount.toLocaleString()} Ratings & Reviews
          </span>
        </div>

        <div style={{ color: 'var(--fk-green)', fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>
          Special price
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '28px', fontWeight: 500 }}>₹{product.price.toLocaleString('en-IN')}</span>
          <span style={{ fontSize: '16px', color: 'var(--fk-text-secondary)', textDecoration: 'line-through' }}>
            ₹{product.mrp.toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: '16px', color: 'var(--fk-green)', fontWeight: 500 }}>
            {discountPercent}% off
          </span>
        </div>

        {/* Stock Status */}
        <div style={{ marginBottom: '24px', fontWeight: 500, fontSize: '14px', 
          color: product.stock === 0 ? 'var(--fk-red)' : product.stock <= 5 ? 'var(--fk-amber)' : 'var(--fk-green)' }}>
          {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Hurry, Only ${product.stock} left!` : 'In Stock'}
        </div>

        {/* Specs Highlights */}
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', marginBottom: '16px' }}>
            <div style={{ width: '110px', color: 'var(--fk-text-secondary)', fontSize: '14px' }}>Highlights</div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(specs).map(([key, val]) => (
                <li key={key}>{key}: {val}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex' }}>
            <div style={{ width: '110px', color: 'var(--fk-text-secondary)', fontSize: '14px' }}>Description</div>
            <div style={{ fontSize: '14px', flex: 1, lineHeight: '1.5' }}>
              {product.description}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
