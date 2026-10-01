import { useEffect } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { Link } from 'react-router-dom';

const CartDrawer = () => {
  const { cartItems, cartCount, cartTotal, isCartOpen, setIsCartOpen, updateCartItem, removeCartItem } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  const handleQuantityChange = async (key, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(key, newQuantity);
  };

  const handleRemoveItem = async (key) => {
    await removeCartItem(key);
  };

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-200 bg-purple-50">
            <h2 className="text-lg font-serif font-bold text-gray-900 tracking-wide">
              Shopping Cart ({cartCount})
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-md text-gray-600 hover:bg-purple-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-600 font-sans font-light">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const product = item;
                  const mainImage = product.images?.[0] || product.image;
                  const isOnSale = product.on_sale && product.sale_price;
                  const price = isOnSale ? product.sale_price : product.price;
                  const regularPrice = product.regular_price;

                  return (
                    <div key={item.key || item.product_id} className="flex gap-4 border border-purple-100 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <Link
                        to={`/product/${product.id || product.product_id}`}
                        onClick={() => setIsCartOpen(false)}
                        className="flex-shrink-0"
                      >
                        {mainImage && (
                          <img
                            src={mainImage.src || mainImage}
                            alt={mainImage.alt || product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                      </Link>

                      <div className="flex-1">
                        <Link
                          to={`/product/${product.id || product.product_id}`}
                          onClick={() => setIsCartOpen(false)}
                        >
                          <h3 className="font-serif font-medium text-gray-900 text-sm line-clamp-2 hover:text-[#4c00b0] transition-colors tracking-wide">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-2 mt-1">
                          {isOnSale ? (
                            <>
                              <span className="font-serif font-bold text-[#4c00b0] text-sm">
                                KSh {price}
                              </span>
                              <span className="text-xs text-gray-400 line-through font-sans">
                                KSh {regularPrice}
                              </span>
                            </>
                          ) : (
                            <span className="font-serif font-bold text-gray-900 text-sm">
                              KSh {price}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border-2 border-purple-200 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.key || item.product_id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="px-2 py-1 text-gray-600 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 py-1 font-medium text-sm font-serif">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.key || item.product_id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-600 hover:bg-purple-100 text-sm"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.key || item.product_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-purple-200 p-4 bg-purple-50">
              <div className="flex justify-between items-center mb-4">
                <span className="font-serif font-medium text-gray-900 tracking-wide">Subtotal</span>
                <span className="font-serif font-bold text-gray-900">KSh {cartTotal}</span>
              </div>
              <Link
                to="/cart"
                onClick={() => setIsCartOpen(false)}
                className="block w-full bg-[#4c00b0] text-white text-center py-3 rounded-lg font-serif font-medium hover:bg-[#3d008f] transition-colors tracking-wide"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg font-serif font-medium hover:bg-gray-800 transition-colors mt-2 tracking-wide"
              >
                Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
