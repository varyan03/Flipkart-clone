import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';

export default function CartPage() {
  const { items, itemCount, subtotal, savings, updateQuantity, removeItem } = useCartStore();
  const navigate = useNavigate();

  if (itemCount === 0) {
    return (
      <div style={{ maxWidth: '1248px', margin: '16px auto', background: '#fff', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 400 }}>Your cart is empty!</h2>
        <div style={{ marginTop: '8px', color: 'var(--fk-text-secondary)' }}>Add items to it now.</div>
        <button 
          onClick={() => navigate('/')}
          style={{ marginTop: '24px', background: 'var(--fk-blue)', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '2px', fontWeight: 500 }}
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1248px', margin: '16px auto', display: 'flex', gap: '16px' }}>
      
      {/* Left: Cart Items */}
      <div style={{ flex: 1, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>My Cart ({itemCount})</h2>
        </div>

        {items.map(({ product, quantity }) => {
          let imageUrl = '';
          try { imageUrl = JSON.parse(product.images)[0]; } catch(e) { imageUrl = product.images; }
          const discountPercent = Math.round((1 - product.price / product.mrp) * 100);

          return (
            <div key={product.id} style={{ display: 'flex', padding: '24px', borderBottom: '1px solid #f0f0f0' }}>
              {/* Product Img & Stepper */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '24px', width: '112px' }}>
                <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '112px', objectFit: 'contain', marginBottom: '16px' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    disabled={quantity <= 1}
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e0e0e0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >-</button>
                  <span style={{ border: '1px solid #e0e0e0', padding: '2px 12px', borderRadius: '2px' }}>{quantity}</span>
                  <button 
                    disabled={quantity >= product.stock}
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e0e0e0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                </div>
              </div>

              {/* Product Details */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 400, marginBottom: '8px' }}>{product.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--fk-text-secondary)', marginBottom: '16px' }}>Seller: RetailNet</div>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--fk-text-secondary)', textDecoration: 'line-through' }}>
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 500 }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--fk-green)', fontWeight: 500 }}>
                    {discountPercent}% Off
                  </span>
                </div>

                <div 
                  onClick={() => removeItem(product.id)}
                  style={{ fontSize: '16px', fontWeight: 500, cursor: 'pointer', display: 'inline-block' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--fk-blue)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'inherit'}
                >
                  REMOVE
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' }}>
          <button 
            onClick={() => navigate('/checkout')}
            style={{ background: 'var(--fk-buy-now)', color: '#fff', padding: '16px 32px', fontSize: '16px', fontWeight: 500, border: 'none', borderRadius: '2px', width: '250px' }}
          >
            PLACE ORDER
          </button>
        </div>
      </div>

      {/* Right: Summary */}
      <div style={{ width: '300px', background: '#fff', height: 'fit-content', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', position: 'sticky', top: '80px' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', color: 'var(--fk-text-secondary)', fontWeight: 500, fontSize: '16px' }}>
          PRICE DETAILS
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Price ({itemCount} items)</span>
            <span>₹{(subtotal + savings).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Discount</span>
            <span style={{ color: 'var(--fk-green)' }}>− ₹{savings.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Delivery Charges</span>
            <span style={{ color: 'var(--fk-green)' }}>Free</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e0e0e0', borderBottom: '1px dashed #e0e0e0', padding: '20px 0', fontWeight: 500, fontSize: '18px' }}>
            <span>Total Amount</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ color: 'var(--fk-green)', fontWeight: 500 }}>
            You will save ₹{savings.toLocaleString('en-IN')} on this order
          </div>
        </div>
      </div>

    </div>
  );
}
