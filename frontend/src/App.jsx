import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useCartStore from './store/cartStore';
import useWishlistStore from './store/wishlistStore';
import Navbar from './components/layout/Navbar';
import HomeNavbar from './components/layout/HomeNavbar';
import Footer from './components/layout/Footer';
import CategoryBar from './components/layout/CategoryBar';
import ProtectedRoute from './components/ui/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WishlistPage from './pages/WishlistPage';
import OrderHistoryPage from './pages/OrderHistoryPage';

export default function App() {
  const checkSession = useAuthStore(state => state.checkSession);
  const authLoading = useAuthStore(state => state.loading);
  const user = useAuthStore(state => state.user);
  const initCart = useCartStore(state => state.initCart);
  const fetchWishlist = useWishlistStore(state => state.fetchWishlist);

  useEffect(() => {
    checkSession().then(() => {
      initCart();
    });
  }, []);

  // Fetch wishlist whenever user changes
  useEffect(() => {
    if (user) fetchWishlist();
  }, [user]);

  if (authLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--fk-blue)'
      }}>
        <span style={{ color: '#fff', fontStyle: 'italic', fontWeight: 'bold', fontSize: '28px' }}>
          Flipkart
        </span>
      </div>
    );
  }

  const AppContent = () => {
    const location = useLocation();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {location.pathname === '/' ? <HomeNavbar /> : <Navbar />}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<><CategoryBar /><LandingPage /></>} />
            <Route path="/products" element={<><CategoryBar /><ProductListingPage /></>} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    );
  };

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
