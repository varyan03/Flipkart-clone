import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useCartStore from '../store/cartStore';
import { cartApi } from '../api/cartApi';
import apiClient from '../api/apiClient'; // Or create orderApi

export default function CheckoutPage() {
  const { cartId, clearCart, items, subtotal } = useCartStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  if (!items || items.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Your cart is empty. Redirecting... {setTimeout(() => navigate('/'), 2000)}</div>;
  }

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      // Direct API call since orderApi isn't fully scaffolded yet
      const res = await apiClient.post('/orders', {
        cartId,
        address: data
      });
      clearCart();
      navigate(`/order-confirmation/${res.data.orderId}`);
    } catch (err) {
      setError(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '2px', outline: 'none', fontSize: '14px', marginBottom: '8px' };

  return (
    <div style={{ maxWidth: '1248px', margin: '16px auto', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      
      {/* Address Form */}
      <div style={{ flex: 1, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
        <div style={{ background: 'var(--fk-blue)', color: '#fff', padding: '16px 24px', fontSize: '16px', fontWeight: 500 }}>
          DELIVERY ADDRESS
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px' }}>
          {error && <div style={{ color: 'var(--fk-red)', marginBottom: '16px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <input {...register('fullName', { required: true, minLength: 3 })} placeholder="Full Name" style={inputStyle} />
              {errors.fullName && <span style={{ color: 'var(--fk-red)', fontSize: '12px' }}>Name is required (min 3 chars).</span>}
            </div>
            <div style={{ flex: 1 }}>
              <input {...register('phone', { required: true, pattern: /^[6-9]\d{9}$/ })} placeholder="10-digit mobile number" style={inputStyle} />
              {errors.phone && <span style={{ color: 'var(--fk-red)', fontSize: '12px' }}>Valid Indian mobile number required.</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <input {...register('pincode', { required: true, pattern: /^\d{6}$/ })} placeholder="Pincode" style={inputStyle} />
              {errors.pincode && <span style={{ color: 'var(--fk-red)', fontSize: '12px' }}>6-digit Pincode required.</span>}
            </div>
            <div style={{ flex: 1 }}>
              <input {...register('city', { required: true })} placeholder="City/District/Town" style={inputStyle} />
              {errors.city && <span style={{ color: 'var(--fk-red)', fontSize: '12px' }}>City is required.</span>}
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <textarea {...register('line1', { required: true, minLength: 5 })} placeholder="Address (Area and Street)" style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
            {errors.line1 && <span style={{ color: 'var(--fk-red)', fontSize: '12px', display: 'block' }}>Address is required.</span>}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <input {...register('line2')} placeholder="Landmark (Optional)" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <select {...register('state', { required: true })} style={inputStyle}>
                <option value="">--Select State--</option>
                <option value="Delhi">Delhi</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Other">Other</option>
              </select>
              {errors.state && <span style={{ color: 'var(--fk-red)', fontSize: '12px' }}>State is required.</span>}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: 'var(--fk-buy-now)', color: '#fff', 
              padding: '16px 32px', fontSize: '16px', fontWeight: 500, 
              border: 'none', borderRadius: '2px', cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'PLACING ORDER...' : 'SAVE AND DELIVER HERE'}
          </button>
        </form>
      </div>

      {/* Order Summary Stub */}
      <div style={{ width: '300px', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', color: 'var(--fk-text-secondary)', fontWeight: 500 }}>
          PRICE DETAILS
        </div>
        <div style={{ padding: '24px', fontSize: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500, fontSize: '18px' }}>
            <span>Amount Payable</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    
    </div>
  );
}
