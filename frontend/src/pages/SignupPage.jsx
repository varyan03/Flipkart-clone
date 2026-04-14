import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signup = useAuthStore(state => state.signup);
  const initCart = useCartStore(state => state.initCart);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signup(name, email, password);
      await initCart();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left-panel">
        <div>
          <h1 className="auth-tagline">Looks like you're new here!</h1>
          <p className="auth-sub-tagline">Sign up with your email & password to get started</p>
        </div>
        <img
          src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png"
          alt="Signup illustration"
          style={{ maxWidth: '200px', marginTop: '32px' }}
        />
      </div>

      <div className="auth-right-panel">
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div style={{ color: 'var(--fk-red)', fontSize: '13px', padding: '8px 12px', background: '#fff0f0', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter Email"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="auth-divider"><span>OR</span></div>

          <Link
            to="/login"
            style={{
              display: 'block', textAlign: 'center', color: 'var(--fk-blue)',
              height: '48px', lineHeight: '48px', border: '1px solid var(--fk-blue)',
              borderRadius: '2px', fontWeight: 500, fontSize: '14px'
            }}
          >
            Existing User? Log in
          </Link>
        </form>
      </div>
    </div>
  );
}
