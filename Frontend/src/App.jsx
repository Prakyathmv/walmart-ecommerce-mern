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
import AdminDashboard from './admin/pages/AdminDashboard';
import FeedbackModal from './components/FeedbackModal';

function App() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
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
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={
        <PrivateRoute>
          <Checkout />
        </PrivateRoute>
      } />
      <Route path="/order-confirmation" element={<OrderConfirmation />} />
      <Route path="/admin" element={<PrivateRoute adminOnly={true}><AdminDashboard /></PrivateRoute>} />
     </Routes>
     <Footer />
    </>
  );
}

export default App;