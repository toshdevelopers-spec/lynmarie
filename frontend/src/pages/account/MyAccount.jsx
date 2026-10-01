import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { ShoppingBag, User, MapPin, Lock, LogOut, ShoppingCart } from 'lucide-react';

const MyAccount = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  const menuItems = [
    { path: '/my-account', label: 'Dashboard', icon: ShoppingBag },
    { path: '/my-account/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/cart', label: 'My Cart', icon: ShoppingCart, action: () => setIsCartOpen(true) },
    { path: '/my-account/profile', label: 'Profile', icon: User },
    { path: '/my-account/addresses', label: 'Addresses', icon: MapPin },
    { path: '/my-account/change-password', label: 'Change Password', icon: Lock },
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <div className="min-h-screen py-8 bg-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 tracking-wide">My Account</h1>
          <p className="text-gray-600 mt-2 font-sans font-light tracking-wide">
            Welcome back, {user?.first_name || user?.username || 'Customer'}!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-purple-100">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  if (item.action) {
                    return (
                      <button
                        key={item.path}
                        onClick={item.action}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full font-serif tracking-wide ${
                          isActive
                            ? 'bg-purple-100 text-purple-700 font-medium'
                            : 'text-gray-700 hover:bg-purple-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        {item.path === '/cart' && cartCount > 0 && (
                          <span className="ml-auto bg-[#4c00b0] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {cartCount}
                          </span>
                        )}
                      </button>
                    );
                  }
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-serif tracking-wide ${
                        isActive
                          ? 'bg-purple-100 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-purple-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full font-serif tracking-wide"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
