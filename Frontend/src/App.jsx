import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Search from './pages/Search';
import './index.css';
import Navigation from './components/Navigation';
import PrivateRoute from './components/PrivateRoute';
import Footer from './components/Footer';
import AdminDashboard from './pages/AdminDashboard';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import FeedbackModal from './components/FeedbackModal';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51TMjUb2KP1zpShwRY2rUc6fXbraA3xKyF0hSd1B53OYHmKofJwV8VFGrAxy1ZfFdp9XUnfGRM5arTHwWJgwBWtA400e5idsPjG');

function App() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <Elements stripe={stripePromise}>
     <Navigation />
     
     <button className="global-feedback-tab" onClick={() => setIsFeedbackOpen(true)}>
       Feedback
     </button>
     <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

     <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={
        <PrivateRoute>
          <Cart />
        </PrivateRoute>
      } />
      <Route path="/checkout" element={
        <PrivateRoute>
          <Checkout />
        </PrivateRoute>
      } />
      <Route path="/order-confirmation" element={<OrderConfirmation />} />
      <Route path="/admin" element={<PrivateRoute adminOnly={true}><AdminDashboard /></PrivateRoute>} />
    </Routes>
    <Footer />
    </Elements>
  );
}

export default App;