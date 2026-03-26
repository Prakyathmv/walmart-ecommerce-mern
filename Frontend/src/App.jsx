import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import './index.css';
import Navigation from './components/Navigation';
import PrivateRoute from './components/PrivateRoute';
import Footer from './components/Footer';

function App() {
  return (
    <>
     <Navigation />
     <Routes>
      <Route path="/" element={<Home />} />
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
    </Routes>
    <Footer />
    </>
    
  );
}

export default App;