import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search, ChevronDown, Mail, LayoutDashboard } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useGetCategoriesQuery } from '../../services/storefrontApi';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: availableCategories = [] } = useGetCategoriesQuery();
  const navRef = useRef(null);
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();
  const { isAuthenticated, user } = useAuth();

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

  const socialLinks = [
    {
      name: 'Facebook',
      icon: () => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: 'https://www.facebook.com/lynmarieboutique/',
    },
    {
      name: 'Instagram',
      icon: () => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      url: 'https://www.instagram.com/lynmarieboutique/',
    },
    {
      name: 'TikTok',
      icon: () => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91 0 .08 1.53.63 3.1 1.76 4.17 1.07 1.06 2.56 1.51 4 1.65v4.03c-1.35-.04-2.7-.33-3.9-.92-.52-.24-1-.55-1.47-.87-.01 2.74.01 5.47-.02 8.2-.07 1.31-.5 2.6-1.25 3.68-1.21 1.78-3.3 2.94-5.46 2.98-1.33.08-2.66-.28-3.8-.96-1.88-1.11-3.2-3.14-3.4-5.32-.02-.5-.03-.99-.01-1.48.17-1.8 1.06-3.53 2.45-4.7 1.58-1.35 3.8-1.99 5.86-1.62.02 1.48-.04 2.96-.04 4.44-1.1-.35-2.4-.25-3.28.5-.64.5-1.02 1.3-1.03 2.11-.08.54.07 1.1.35 1.57.64 1.1 2.21 1.73 3.43 1.33.82-.26 1.43-.96 1.62-1.8.08-.47.06-.95.06-1.42.01-5.2.02-10.4.02-15.6z" />
        </svg>
      ),
      url: 'https://www.tiktok.com/@lynmarie_boutique?_r=1&_t=ZS-9ABZLCPoEAn',
    },
    {
      name: 'Email',
      icon: Mail,
      url: 'mailto:info@lynmarieboutique.com',
    },
  ];

  return (
    <nav ref={navRef} className="storefront-nav relative z-50 shadow-sm backdrop-blur-md">
      {/* Social Media Bar */}
      <div className="bg-[#4c00b0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-2">
            <span className="font-brand text-[10px] font-bold uppercase tracking-[.18em] text-white sm:text-xs">Style <i className="px-1 not-italic text-[#e5cfa8]">|</i> Comfort <i className="px-1 not-italic text-[#e5cfa8]">|</i> Confidence</span>
            <div className="flex items-center justify-end space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-purple-200 transition-colors group"
                aria-label={social.name}
              >
                {typeof social.icon === 'function' ? (
                  <div className="group-hover:scale-110 transition-transform">
                    {social.icon()}
                  </div>
                ) : (
                  <social.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
              </a>
            ))}
            </div>
          </div>
        </div>
      </div>

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
              className="h-10 w-auto group-hover:scale-105 transition-transform"
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
            {user?.role === 'ADMIN' && <Link to="/admin" aria-label="Open admin dashboard" title="Admin dashboard" className="inline-flex items-center justify-center gap-1 rounded-full border border-purple-200 px-2 sm:px-3 py-1.5 text-xs font-medium text-[#4c00b0] hover:bg-purple-50 whitespace-nowrap"><LayoutDashboard className="h-3.5 w-3.5" /><span className="hidden sm:inline">Admin</span></Link>}
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
