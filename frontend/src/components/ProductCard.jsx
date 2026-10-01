import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import { useCart } from '../hooks/useCart';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const mainImage = product.images?.[0];
  const isOnSale = product.prices?.regular_price !== product.prices?.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product.id, 1, product);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    // This would be handled by a wishlist context
    console.log('Add to wishlist:', product.id);
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {mainImage ? (
          <img
            src={mainImage.src}
            alt={mainImage.alt || product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-50">
            <span className="text-6xl">👗</span>
          </div>
        )}
        
        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-3 left-3 bg-[#4c00b0] text-white px-3 py-1 rounded-full text-sm font-medium">
            Sale
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlist}
            className="p-2 bg-white rounded-full shadow-md hover:bg-purple-50 transition-colors"
          >
            <Heart className="w-5 h-5 text-gray-600 hover:text-[#4c00b0]" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#4c00b0] text-white py-3 rounded-lg font-medium hover:bg-[#3d008f] transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-[#4c00b0] transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2">
          {isOnSale ? (
            <>
              <span className="font-bold text-[#4c00b0] text-lg">
                {formatPrice(product.prices.price / 100)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.prices.regular_price / 100)}
              </span>
            </>
          ) : (
            <span className="font-bold text-gray-900 text-lg">
              {formatPrice(product.prices.price / 100)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
