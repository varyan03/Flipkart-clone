import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    orderApi.getOrderHistory()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setOrders(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px', color: 'var(--fk-text-secondary)' }}>
        Loading orders...
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div style={{ maxWidth: '1248px', margin: '32px auto', textAlign: 'center', padding: '64px 16px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
        <h2 style={{ fontWeight: 500, fontSize: '18px', marginBottom: '8px' }}>No Orders Yet</h2>
        <p style={{ color: 'var(--fk-text-secondary)', marginBottom: '24px' }}>
          You haven't placed any orders yet. Start shopping!
        </p>
        <Link
          to="/products"
          style={{ background: 'var(--fk-blue)', color: '#fff', padding: '12px 32px', borderRadius: '2px', fontWeight: 500 }}
        >
          Shop Now
        </Link>
      </div>
    );
  }

  const parseImages = (images) => {
    try { return JSON.parse(images); } catch { return [images]; }
  };

  return (
    <div style={{ maxWidth: '1248px', margin: '16px auto', padding: '0 16px' }}>
      <h2 style={{ fontWeight: 500, fontSize: '18px', marginBottom: '16px' }}>My Orders</h2>

      <div className="order-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <div>
                <span className="order-id">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                <span className="order-date">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>
              <span className={`order-status-badge order-status--${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>

            <div className="order-items-preview">
              {order.items.slice(0, 3).map((item, idx) => {
                const imgs = parseImages(item.product.images);
                return (
                  <div key={idx} className="order-item-row">
                    <img
                      src={imgs[0]}
                      alt={item.product.name}
                      className="order-item-thumb"
                      loading="lazy"
                    />
                    <div className="order-item-info">
                      <p className="order-item-name">{item.product.name}</p>
                      <p className="order-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="order-item-price">
                      ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                );
              })}
              {order.items.length > 3 && (
                <p className="order-more-items">+{order.items.length - 3} more items</p>
              )}
            </div>

            <div className="order-card-footer">
              <div className="order-delivery-info">
                {order.address && (
                  <span>Delivered to: {order.address.city} - {order.address.pincode}</span>
                )}
              </div>
              <div className="order-total">
                <span>Total: </span>
                <strong>₹{Number(order.total).toLocaleString('en-IN')}</strong>
              </div>
              <Link to={`/order-confirmation/${order.id}`} className="order-view-details">
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
