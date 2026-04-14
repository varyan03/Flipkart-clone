import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useAuthStore(state => state.login);
  const initCart = useCartStore(state => state.initCart);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      await initCart();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left-panel">
        <div>
          <h1 className="auth-tagline">Login</h1>
          <p className="auth-sub-tagline">Get access to your Orders, Wishlist and Recommendations</p>
        </div>
        <img
          src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png"
          alt="Login illustration"
          style={{ maxWidth: '200px', marginTop: '32px' }}
        />
      </div>

      {/* Right panel */}
      <div className="auth-right-panel">
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div style={{ color: 'var(--fk-red)', fontSize: '13px', padding: '8px 12px', background: '#fff0f0', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter Email"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
              className="form-input"
            />
          </div>

          <p className="auth-terms">
            By continuing, you agree to Flipkart's Terms of Use and Privacy Policy.
          </p>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--fk-buy-now)', color: '#fff',
              height: '48px', border: 'none', borderRadius: '2px',
              fontSize: '16px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="auth-divider"><span>OR</span></div>

          <Link
            to="/signup"
            style={{
              display: 'block', textAlign: 'center', color: 'var(--fk-blue)',
              height: '48px', lineHeight: '48px', border: '1px solid var(--fk-blue)',
              borderRadius: '2px', fontWeight: 500, fontSize: '14px'
            }}
          >
            New to Flipkart? Create an account
          </Link>
        </form>
      </div>
    </div>
  );
}
