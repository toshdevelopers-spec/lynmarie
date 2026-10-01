import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../utils/formatPrice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import { checkoutService } from '../services/checkout';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    // Billing
    billing_first_name: user?.first_name || '',
    billing_last_name: user?.last_name || '',
    billing_email: user?.email || '',
    billing_phone: user?.phone || '',
    billing_address_1: '',
    billing_address_2: '',
    billing_city: '',
    billing_state: '',
    billing_postcode: '',
    billing_country: 'KE',
    // Shipping
    shipping_first_name: user?.first_name || '',
    shipping_last_name: user?.last_name || '',
    shipping_address_1: '',
    shipping_address_2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postcode: '',
    shipping_country: 'KE',
    // Notes
    order_notes: '',
    // Payment
    payment_method: 'cod',
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const billing = {
        first_name: formData.billing_first_name,
        last_name: formData.billing_last_name,
        email: formData.billing_email,
        phone: formData.billing_phone,
        address_1: formData.billing_address_1,
        city: formData.billing_city,
        state: formData.billing_state,
        postcode: formData.billing_postcode,
      };
      const shipping = sameAsBilling ? undefined : {
        first_name: formData.shipping_first_name,
        last_name: formData.shipping_last_name,
        address_1: formData.shipping_address_1,
        city: formData.shipping_city,
        state: formData.shipping_state,
        phone: formData.billing_phone,
      };
      const order = await checkoutService.createOrder({
        items: cartItems.map(item => ({ productId: item.product_id || item.id, quantity: item.quantity })),
        billing,
        shipping,
        notes: formData.order_notes,
        payment_method: formData.payment_method,
      });
      await clearCart();
      navigate('/order-confirmation', { state: { order } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Billing Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="billing_first_name"
                  label="First Name"
                  type="text"
                  value={formData.billing_first_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="billing_last_name"
                  label="Last Name"
                  type="text"
                  value={formData.billing_last_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="billing_email"
                  label="Email Address"
                  type="email"
                  value={formData.billing_email}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="billing_phone"
                  label="Phone Number"
                  type="tel"
                  value={formData.billing_phone}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="billing_address_1"
                  label="Street Address"
                  type="text"
                  value={formData.billing_address_1}
                  onChange={handleChange}
                  required
                  className="md:col-span-2"
                />
                <Input
                  name="billing_address_2"
                  label="Apartment, suite, etc. (Optional)"
                  type="text"
                  value={formData.billing_address_2}
                  onChange={handleChange}
                  className="md:col-span-2"
                />
                <Input
                  name="billing_city"
                  label="City"
                  type="text"
                  value={formData.billing_city}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="billing_state"
                  label="State/Province"
                  type="text"
                  value={formData.billing_state}
                  onChange={handleChange}
                />
                <Input
                  name="billing_postcode"
                  label="Postal Code"
                  type="text"
                  value={formData.billing_postcode}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="billing_country"
                  label="Country"
                  type="text"
                  value={formData.billing_country}
                  onChange={handleChange}
                  disabled
                />
              </div>
            </div>

            {/* Shipping Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Shipping Details</h2>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sameAsBilling}
                    onChange={(e) => setSameAsBilling(e.target.checked)}
                    className="rounded border-gray-300 text-purple-700 focus:ring-[#4c00b0]"
                  />
                  <span className="text-sm text-gray-600">Same as billing</span>
                </label>
              </div>

              {!sameAsBilling && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="shipping_first_name"
                    label="First Name"
                    type="text"
                    value={formData.shipping_first_name}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    name="shipping_last_name"
                    label="Last Name"
                    type="text"
                    value={formData.shipping_last_name}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    name="shipping_address_1"
                    label="Street Address"
                    type="text"
                    value={formData.shipping_address_1}
                    onChange={handleChange}
                    required
                    className="md:col-span-2"
                  />
                  <Input
                    name="shipping_address_2"
                    label="Apartment, suite, etc. (Optional)"
                    type="text"
                    value={formData.shipping_address_2}
                    onChange={handleChange}
                    className="md:col-span-2"
                  />
                  <Input
                    name="shipping_city"
                    label="City"
                    type="text"
                    value={formData.shipping_city}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    name="shipping_state"
                    label="State/Province"
                    type="text"
                    value={formData.shipping_state}
                    onChange={handleChange}
                  />
                  <Input
                    name="shipping_postcode"
                    label="Postal Code"
                    type="text"
                    value={formData.shipping_postcode}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    name="shipping_country"
                    label="Country"
                    type="text"
                    value={formData.shipping_country}
                    onChange={handleChange}
                    disabled
                  />
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Notes (Optional)</h2>
              <textarea
                name="order_notes"
                value={formData.order_notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c00b0]"
                placeholder="Any special instructions for your order?"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  const product = item;
                  const mainImage = product.images?.[0];
                  
                  return (
                    <div key={item.key} className="flex gap-3">
                      {mainImage && (
                        <img
                          src={mainImage.src}
                          alt={mainImage.alt || product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="font-bold text-gray-900 text-sm">
                          {formatPrice((product.prices?.price != null ? product.prices.price / 100 : product.price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-[#4c00b0] transition-colors">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === 'cod'}
                      onChange={handleChange}
                      className="text-[#4c00b0] focus:ring-[#4c00b0]"
                    />
                    <span className="text-sm">Cash on Delivery</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-[#4c00b0] transition-colors">
                    <input
                      type="radio"
                      name="payment_method"
                      value="mpesa"
                      checked={formData.payment_method === 'mpesa'}
                      onChange={handleChange}
                      className="text-[#4c00b0] focus:ring-[#4c00b0]"
                    />
                    <span className="text-sm">M-Pesa</span>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                size="large"
                className="w-full mt-6"
                loading={loading}
              >
                Place Order
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
