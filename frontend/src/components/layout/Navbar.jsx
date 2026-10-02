import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useGetCategoriesQuery } from '../../services/storefrontApi';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: availableCategories = [] } = useGetCategoriesQuery();
  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();
  const { isAuthenticated, user } = useAuth();
  const isHome = location.pathname === '/';
  const isHomeTop = isHome && !isScrolled;

  useEffect(() => {
    if (!isHome) {
      setIsScrolled(false);
      return undefined;
    }

    const updateScrollState = () => setIsScrolled(window.scrollY > 12);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, [isHome]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    if (!activeDropdown && !isMobileMenuOpen) return undefined;

    const handlePointerDown = event => {
      const dropdown = event.target.closest?.('[data-dropdown]');
      if (!dropdown || dropdown.dataset.dropdown !== activeDropdown) setActiveDropdown(null);
      if (!navRef.current?.contains(event.target)) setIsMobileMenuOpen(false);
    };
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDropdown, isMobileMenuOpen]);
  const navCategories = [
    { name: 'Shop', items: availableCategories.map(category => ({ name: category.name, path: `/category/${category.slug}` })) },
    { name: 'Sale', items: [{ name: 'All sale items', path: '/shop?on_sale=true' }] },
  ];

  return (
    <nav
      ref={navRef}
      className={`storefront-nav sticky top-0 z-50 shadow-sm backdrop-blur-md ${isHomeTop ? 'storefront-nav--hero-top' : ''} ${isHome && isScrolled ? 'storefront-nav--fixed' : ''} ${isHomeTop && (isMobileMenuOpen || isSearchOpen || activeDropdown) ? 'storefront-nav--panel-open' : ''}`}
    >
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-purple-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <img
              src="/logo.webp"
              alt="Lynmarie Boutique"
              className="h-14 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Navigation with Dropdowns */}
          <div className="hidden md:flex items-center space-x-6">
            {navCategories.map((category) => (
              <div
                key={category.name}
                className="relative group"
                data-dropdown={category.name}
              >
                <button
                  type="button"
                  aria-expanded={activeDropdown === category.name}
                  onClick={() => setActiveDropdown(activeDropdown === category.name ? null : category.name)}
                  className="flex items-center gap-1 text-sm text-gray-700 hover:text-[#4c00b0] transition-colors font-serif font-medium py-2 tracking-wide"
                >
                  {category.name}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {activeDropdown === category.name && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-purple-200 overflow-hidden z-50">
                    <div className="py-2">
                      {category.items.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setActiveDropdown(null)}
                          className="block px-4 py-3 text-gray-700 hover:bg-purple-100 hover:text-[#4c00b0] transition-colors font-serif tracking-wide"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link
              to="/shop?sort=date_desc"
              className="text-sm text-gray-700 hover:text-[#4c00b0] transition-colors font-serif font-medium py-2 tracking-wide"
            >
              New In
            </Link>
            <Link to="/contact" className="rounded-full bg-[#4c00b0] px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-sm transition hover:bg-[#3d008f]">Enquire</Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-2">
            {user?.role === 'ADMIN' && <Link to="/admin" aria-label="Open admin dashboard" title="Admin dashboard" className="storefront-admin-link inline-flex items-center justify-center gap-1 rounded-full px-2 sm:px-3 py-1.5 text-xs font-medium whitespace-nowrap"><LayoutDashboard className="h-3.5 w-3.5" /><span className="hidden sm:inline">Admin</span></Link>}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 rounded-full text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-all"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <Link
              to={isAuthenticated ? '/my-account' : '/auth/login'}
              className="p-1.5 rounded-full text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-all"
              aria-label="Account"
            >
              <User className="w-[18px] h-[18px]" />
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 rounded-full text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-all relative"
              aria-label="Cart"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#4c00b0] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-purple-200 animate-fade-in bg-purple-50/50">
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <input
                type="search"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 bg-white border-2 border-purple-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4c00b0] focus:border-[#4c00b0] transition-all shadow-sm font-sans tracking-wide"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4c00b0] hover:text-purple-700 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-200 animate-fade-in bg-purple-50/50">
            <div className="space-y-2">
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-lg bg-[#4c00b0] px-4 py-3 text-center font-semibold text-white">Enquire with us</Link>
              {navCategories.map((category) => (
                <div key={category.name} data-dropdown={category.name}>
                  <button
                    type="button"
                    aria-expanded={activeDropdown === category.name}
                    onClick={() => setActiveDropdown(activeDropdown === category.name ? null : category.name)}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-purple-100 rounded-lg font-serif font-medium transition-colors tracking-wide"
                  >
                    {category.name}
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === category.name ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === category.name && (
                    <div className="pl-8 space-y-1">
                      {category.items.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => { setIsMobileMenuOpen(false); setActiveDropdown(null); }}
                          className="block px-4 py-2 text-gray-700 hover:text-[#4c00b0] hover:bg-purple-100 rounded-lg transition-colors font-serif tracking-wide"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                to="/shop?sort=date_desc"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-800 hover:bg-purple-100 rounded-lg font-serif font-medium transition-colors tracking-wide"
              >
                New In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
