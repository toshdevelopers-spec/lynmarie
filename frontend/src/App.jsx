import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
const Home = lazy(() => import('./pages/Home'));
const Collections = lazy(() => import('./pages/Collections'));
const Shop = lazy(() => import('./pages/Shop'));
const Product = lazy(() => import('./pages/Product'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const MyAccount = lazy(() => import('./pages/account/MyAccount'));
const Orders = lazy(() => import('./pages/account/Orders'));
const Profile = lazy(() => import('./pages/account/Profile'));
const Addresses = lazy(() => import('./pages/account/Addresses'));
const ChangePassword = lazy(() => import('./pages/account/ChangePassword'));
const Contact = lazy(() => import('./pages/Contact'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Returns = lazy(() => import('./pages/Returns'));
const SizeGuide = lazy(() => import('./pages/SizeGuide'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
import { useAuth } from './hooks/useAuth';
import { track } from './services/tracking';
import FloatingWhatsApp from './components/FloatingWhatsApp';

function AdminOnly() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-[60vh] grid place-items-center">Loading your access…</div>;
  return user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/auth/login" replace />;
}

function StoreAnalytics() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    track('PAGE_VIEW', { path: location.pathname });
    const term = new URLSearchParams(location.search).get('search');
    if (term) track('SEARCH', { term: term.slice(0, 120) });
  }, [location.pathname, location.search]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isHome = location.pathname === '/';

  useEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousScrollBehavior;
  }, [location.pathname]);

  return <>
    <StoreAnalytics />
    <div className={isAdmin ? 'min-h-screen' : `storefront-shell min-h-screen flex flex-col${isHome ? ' is-home' : ''}`}>
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        <Suspense fallback={<div className="route-loading" aria-label="Loading page" />}>
          <Routes>
                <Route path="/admin" element={<AdminOnly />} />
                <Route path="/" element={<Home />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/category/:slug" element={<Shop />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                
                {/* Auth Routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                
                {/* Account Routes */}
                <Route path="/my-account" element={<MyAccount />}>
                  <Route index element={<Orders />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="addresses" element={<Addresses />} />
                  <Route path="change-password" element={<ChangePassword />} />
                </Route>
                
                {/* Information Pages */}
                <Route path="/contact" element={<Contact />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/size-guide" element={<SizeGuide />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <CartDrawer />}
      {!isAdmin && <FloatingWhatsApp />}
    </div>
  </>;
}

function App() {
  return <BrowserRouter><AuthProvider><CartProvider><AppContent /></CartProvider></AuthProvider></BrowserRouter>;
}

export default App;
