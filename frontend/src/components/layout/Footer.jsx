import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useGetCategoriesQuery } from '../../services/storefrontApi';

const Footer = () => {
  const { data: categories = [] } = useGetCategoriesQuery();
  const availableCategories = categories.filter(category => category._count?.products > 0);

  return (
    <footer className="bg-[#4c00b0] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-4 tracking-wide">Lyn Marie Boutique</h3>
            <p className="text-purple-200 text-sm font-sans font-light tracking-wide">
              From Nairobi, with love — timeless pieces for your everyday glow. 
              Discover our curated collection of elegant fashion for every occasion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-4 tracking-wide">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-purple-200 hover:text-purple-100 transition-colors text-sm font-sans">
                  Shop All
                </Link>
              </li>
              <li><Link to="/collections" className="text-purple-200 hover:text-purple-100 transition-colors text-sm font-sans">All collections</Link></li>
              {availableCategories.slice(0, 5).map(category => (
                <li key={category.id}>
                  <Link to={`/category/${category.slug}`} className="text-purple-200 hover:text-purple-100 transition-colors text-sm font-sans">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-4 tracking-wide">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-purple-200 hover:text-purple-100 transition-colors text-sm font-sans">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-purple-200 hover:text-purple-100 transition-colors text-sm font-sans">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-purple-200 hover:text-purple-100 transition-colors text-sm font-sans">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-purple-200 hover:text-purple-100 transition-colors text-sm font-sans">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-purple-200 hover:text-purple-100 transition-colors text-sm font-sans">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-4 tracking-wide">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-purple-200 flex-shrink-0 mt-0.5" />
                <a href="tel:+254794071233" className="text-purple-100 text-sm font-sans hover:text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">0794 071233</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-200 flex-shrink-0 mt-0.5" />
                <a href="mailto:info@lynmarieboutique.com" className="text-purple-100 text-sm font-sans hover:text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">info@lynmarieboutique.com</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
                <a href="https://www.google.com/maps/search/?api=1&query=Jamia+Mall%2C+Nairobi" target="_blank" rel="noopener noreferrer" className="text-purple-100 text-sm font-sans hover:text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Jamia Mall, 1st Floor, Shop F56, Nairobi</a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm">
              <a href="https://www.facebook.com/lynmarieboutique/" target="_blank" rel="noopener noreferrer" className="text-purple-200 hover:text-white transition-colors" aria-label="Facebook">Facebook</a>
              <a href="https://www.instagram.com/lynmarieboutique/" target="_blank" rel="noopener noreferrer" className="text-purple-200 hover:text-white transition-colors" aria-label="Instagram">Instagram</a>
              <a href="https://www.tiktok.com/@lynmarie_boutique?_r=1&_t=ZS-9ABZLCPoEAn" target="_blank" rel="noopener noreferrer" className="text-purple-200 hover:text-white transition-colors" aria-label="TikTok">TikTok</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#4c00b0] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-purple-200 text-sm font-sans">
            © {new Date().getFullYear()} Lyn Marie Boutique. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-purple-200 hover:text-purple-100 transition-colors text-sm font-sans">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-purple-200 hover:text-purple-100 transition-colors text-sm font-sans">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
