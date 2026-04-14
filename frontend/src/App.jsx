import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useCartStore from './store/cartStore';
import Navbar from './components/layout/Navbar';
import CategoryBar from './components/layout/CategoryBar';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

function App() {
  const initCart = useCartStore((state) => state.initCart);

  useEffect(() => {
    initCart();
  }, [initCart]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <>
            <CategoryBar />
            <ProductListingPage />
          </>
        } />
        <Route path="/products" element={
          <>
            <CategoryBar />
            <ProductListingPage />
          </>
        } />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
