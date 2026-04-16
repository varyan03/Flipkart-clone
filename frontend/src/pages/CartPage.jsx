import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';

export default function CartPage() {
  const items = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const getItemCount = useCartStore(state => state.getItemCount);
  const getSubtotal = useCartStore(state => state.getSubtotal);
  const getSavings = useCartStore(state => state.getSavings);
  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const savings = getSavings();
  const navigate = useNavigate();

  if (itemCount === 0) {
    return (
      <div className="cart-empty-state">
        <h2>Your cart is empty!</h2>
        <div className="cart-empty-subtext">Add items to it now.</div>
        <button 
          onClick={() => navigate('/')}
          className="cart-empty-btn"
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      
      {/* Left: Cart Items */}
      <div className="cart-main-panel">
        <div className="cart-main-header">
          <h2>My Cart ({itemCount})</h2>
        </div>

        {items.map(({ product, quantity }) => {
          const images = Array.isArray(product.images) 
            ? product.images 
            : (() => { try { return JSON.parse(product.images); } catch { return [product.images]; } })();
          const imageUrl = images[0] || '';
          const discountPercent = Math.round((1 - product.price / product.mrp) * 100);

          return (
            <div key={product.id} className="cart-item-row">
              {/* Product Img & Stepper */}
              <div className="cart-item-left">
                <img src={imageUrl} alt={product.name} className="cart-item-image" />
                
                <div className="cart-item-stepper">
                  <button 
                    disabled={quantity <= 1}
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="cart-step-btn"
                  >-</button>
                  <span className="cart-step-count">{quantity}</span>
                  <button 
                    disabled={quantity >= product.stock}
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="cart-step-btn"
                  >+</button>
                </div>
              </div>

              {/* Product Details */}
              <div className="cart-item-details">
                <div className="cart-item-name">{product.name}</div>
                <div className="cart-item-seller">Seller: RetailNet</div>
                
                <div className="cart-item-price-row">
                  <span className="cart-item-mrp">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                  <span className="cart-item-price">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="cart-item-discount">
                    {discountPercent}% Off
                  </span>
                </div>

                <div 
                  onClick={() => removeItem(product.id)}
                  className="cart-item-remove"
                >
                  REMOVE
                </div>
              </div>
            </div>
          );
        })}

        <div className="cart-main-footer">
          <button 
            onClick={() => navigate('/checkout')}
            className="cart-place-order-btn"
          >
            PLACE ORDER
          </button>
        </div>
      </div>

      {/* Right: Summary */}
      <div className="cart-summary-panel">
        <div className="cart-summary-head">
          PRICE DETAILS
        </div>
        <div className="cart-summary-body">
          <div className="cart-summary-row">
            <span>Price ({itemCount} items)</span>
            <span>₹{(subtotal + savings).toLocaleString('en-IN')}</span>
          </div>
          <div className="cart-summary-row">
            <span>Discount</span>
            <span className="cart-summary-green">− ₹{savings.toLocaleString('en-IN')}</span>
          </div>
          <div className="cart-summary-row">
            <span>Delivery Charges</span>
            <span className="cart-summary-green">Free</span>
          </div>
          <div className="cart-summary-total">
            <span>Total Amount</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="cart-summary-savings">
            You will save ₹{savings.toLocaleString('en-IN')} on this order
          </div>
        </div>
      </div>

    </div>
  );
}
