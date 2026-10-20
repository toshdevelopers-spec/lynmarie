import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
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
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'));
import { useAuth } from './hooks/useAuth';
import { track } from './services/tracking';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Loader from './components/ui/Loader';

function AdminOnly() {
  const { user, loading } = useAuth();
  if (loading) return <Loader size="large" fullScreen label="Checking your access" />;
  return user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/auth/login" replace />;
}

function SellerOnly() {
  const { user, loading } = useAuth();
  if (loading) return <Loader size="large" fullScreen label="Checking your access" />;
  return ['ADMIN', 'SELLER'].includes(user?.role) ? <SellerDashboard /> : <Navigate to="/auth/login" replace />;
}

function StoreAnalytics() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller')) return;
    track('PAGE_VIEW', { path: location.pathname });
    const term = new URLSearchParams(location.search).get('search');
    if (term) track('SEARCH', { term: term.slice(0, 120) });
  }, [location.pathname, location.search]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const [renderedLocation, setRenderedLocation] = useState(location);
  const [transitionPhase, setTransitionPhase] = useState('entering');
  const routeTimer = useRef(null);
  const isStaffDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller');
  const isHome = location.pathname === '/';

  useEffect(() => {
    if (location.pathname === renderedLocation.pathname) {
      if (location.key !== renderedLocation.key) setRenderedLocation(location);
      return undefined;
    }

    window.clearTimeout(routeTimer.current);
    setTransitionPhase('leaving');
    routeTimer.current = window.setTimeout(() => {
      setRenderedLocation(location);
      setTransitionPhase('entering');
    }, 110);
    return () => window.clearTimeout(routeTimer.current);
  }, [location, renderedLocation]);

  useEffect(() => {
    const privatePage = /^\/(auth|admin|seller|cart|checkout|my-account|order-confirmation)(\/|$)/.test(location.pathname);
    let robots = document.head.querySelector('meta[name="robots"]');
    if (privatePage) {
      if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
      robots.content = 'noindex,follow';
    } else if (robots?.content === 'noindex,follow') robots.remove();
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousScrollBehavior;
  }, [location.pathname]);

  return <>
    <StoreAnalytics />
    <div className={isStaffDashboard ? 'min-h-screen' : `storefront-shell min-h-screen flex flex-col${isHome ? ' is-home' : ''}`}>
      {!isStaffDashboard && <Navbar />}
      <main className="flex-1">
        <div className={`route-transition route-transition--${transitionPhase}`}>
        <Suspense fallback={<Loader size="large" fullScreen label="Preparing your page" />}>
          <Routes location={renderedLocation}>
                <Route path="/admin" element={<AdminOnly />} />
                <Route path="/seller" element={<SellerOnly />} />
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
        </div>
      </main>
      {!isStaffDashboard && <Footer />}
      {!isStaffDashboard && <CartDrawer />}
      {!isStaffDashboard && <FloatingWhatsApp />}
    </div>
  </>;
}

function App() {
  return <BrowserRouter><AuthProvider><CartProvider><AppContent /></CartProvider></AuthProvider></BrowserRouter>;
}

export default App;
