import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/orders/${orderId}`)
      .then(res => setOrder(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Verifying order...</div>;
  if (!order) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Order not found.</div>;

  const deliveryDate = new Date(order.createdAt);
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  return (
    <div style={{ maxWidth: '800px', margin: '32px auto', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', padding: '32px', textAlign: 'center' }}>
      
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'var(--fk-green)', marginBottom: '24px' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <h1 style={{ color: 'var(--fk-green)', margin: '0 0 16px 0', fontSize: '24px', fontWeight: 500 }}>
        Order Placed Successfully!
      </h1>

      <div style={{ background: '#f5f5f5', display: 'inline-block', padding: '8px 16px', borderRadius: '24px', fontSize: '14px', marginBottom: '24px', fontFamily: 'monospace' }}>
        Order ID: {order.id.split('-')[0].toUpperCase()}
      </div>

      <div style={{ fontSize: '18px', marginBottom: '32px' }}>
        Estimated Delivery: <span style={{ fontWeight: 500 }}>{deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
      </div>

      <div style={{ textAlign: 'left', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '16px', marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--fk-text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Delivering To</div>
        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{order.address.fullName} | {order.address.phone}</div>
        <div style={{ color: 'var(--fk-text-secondary)', fontSize: '14px' }}>
          {order.address.line1}, {order.address.line2 ? order.address.line2 + ', ' : ''}
          {order.address.city}, {order.address.state} - {order.address.pincode}
        </div>
      </div>

      <div style={{ textAlign: 'left', marginBottom: '32px' }}>
        {order.items.map(item => {
          let imageUrl = '';
          try { imageUrl = JSON.parse(item.product.images)[0]; } catch(e) { imageUrl = item.product.images; }
          return (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
              <img src={imageUrl} alt={item.product.name} style={{ width: '64px', height: '64px', objectFit: 'contain', marginRight: '16px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{item.product.name}</div>
                <div style={{ color: 'var(--fk-text-secondary)', fontSize: '14px' }}>Qty: {item.quantity}</div>
              </div>
              <div style={{ fontWeight: 500, fontSize: '16px' }}>
                ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
              </div>
            </div>
          );
        })}
      </div>

      <button 
        onClick={() => navigate('/')}
        style={{
          background: 'var(--fk-blue)', color: '#fff', padding: '16px 32px', border: 'none', borderRadius: '2px', fontSize: '16px', fontWeight: 500
        }}
      >
        CONTINUE SHOPPING
      </button>

    </div>
  );
}
