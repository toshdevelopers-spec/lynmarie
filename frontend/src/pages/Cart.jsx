import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatPrice';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';

const Cart = () => {
  const {
    cartItems,
    cartCount,
    cartTotal,
    cartSubtotal,
    cartSavings,
    loading,
    error,
    updateCartItem,
    removeCartItem,
    clearCart,
  } = useCart();

  const handleQuantityChange = async (key, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(key, newQuantity);
  };

  const handleRemoveItem = async (key) => {
    await removeCartItem(key);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({cartCount})</h1>

        {error && <ErrorMessage message={error} />}

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link to="/shop">
              <Button size="large">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = item;
                const mainImage = product.images?.[0];
                const isOnSale = product.prices.regular_price !== product.prices.price;

                return (
                  <div key={item.key} className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
                    <Link to={`/product/${product.id}`} className="flex-shrink-0">
                      {mainImage && (
                        <img
                          src={mainImage.src}
                          alt={mainImage.alt || product.name}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                    </Link>

                    <div className="flex-1">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-medium text-gray-900 hover:text-[#4c00b0] transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mt-2">
                        {isOnSale ? (
                          <>
                            <span className="font-bold text-[#4c00b0]">
                              {formatPrice(product.prices.price / 100)}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(product.prices.regular_price / 100)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-gray-900">
                            {formatPrice(product.prices.price / 100)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => handleQuantityChange(item.key, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.key, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.key)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-gray-900">
                        {formatPrice((product.prices.price / 100) * item.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={handleClearCart}>
                  Clear Cart
                </Button>
                <Link to="/shop">
                  <Button variant="ghost">Continue Shopping</Button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartSubtotal)}</span>
                  </div>

                  {cartSavings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Savings</span>
                      <span>-{formatPrice(cartSavings)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>

                  <hr className="my-4" />

                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <Link to="/checkout" className="block mt-6">
                  <Button size="large" className="w-full">
                    Proceed to Checkout
                  </Button>
                </Link>

                <div className="mt-4 text-center text-sm text-gray-600">
                  <p>Secure checkout powered by WooCommerce</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
