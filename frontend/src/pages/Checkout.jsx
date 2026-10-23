import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../utils/formatPrice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import { checkoutService } from '../services/checkout';
import { hideBrokenProductImage } from '../utils/images';
import { authService } from '../services/auth';

const EditableCheckoutInput = ({ user, editingFields, setEditingFields, ...props }) => {
  const inputRef = useRef(null);
  const filled = String(props.value || '').trim().length > 0;
  const locked = Boolean(user && filled && !editingFields[props.name]);
  const editField = () => {
    setEditingFields(current => ({ ...current, [props.name]: true }));
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };
  return <div className="relative"><Input {...props} ref={inputRef} readOnly={locked} className={`${props.className || ''} ${user ? 'pr-12' : ''}`} />{user && <button type="button" onClick={editField} className="absolute right-2 top-[2rem] rounded-md p-2 text-purple-800 hover:bg-purple-100" aria-label={`Edit ${props.label}`} title={`Edit ${props.label}`}><Pencil size={16} /></button>}</div>;
};

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
    billing_city: '',
    billing_county: '',
    billing_country: 'KE',
    // Shipping
    shipping_first_name: user?.first_name || '',
    shipping_last_name: user?.last_name || '',
    shipping_address_1: '',
    shipping_city: '',
    shipping_county: '',
    shipping_country: 'KE',
    // Notes
    order_notes: '',
    // Payment
    payment_method: 'cod',
    payment_reference: '',
    fulfillment_method: 'DELIVERY',
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [editingFields, setEditingFields] = useState({});
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    let active = true;
    authService.getAddresses().then(addresses => {
      if (!active) return;
      const saved = addresses.shipping || {};
      setFormData(current => ({ ...current, billing_first_name: user.first_name || current.billing_first_name, billing_last_name: user.last_name || current.billing_last_name, billing_email: user.email || current.billing_email, shipping_first_name: user.first_name || current.shipping_first_name, shipping_last_name: user.last_name || current.shipping_last_name, billing_phone: user.phone || saved.phone || current.billing_phone, billing_address_1: saved.address_1 || current.billing_address_1, billing_city: saved.city || current.billing_city, billing_county: saved.state || current.billing_county, shipping_address_1: saved.address_1 || current.shipping_address_1, shipping_city: saved.city || current.shipping_city, shipping_county: saved.state || current.shipping_county }));
    }).catch(() => {});
    return () => { active = false; };
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(current => {
      if (name === 'fulfillment_method') return {
        ...current,
        fulfillment_method: value,
        payment_method: value === 'PICKUP' && current.payment_method === 'cod' ? 'pay_on_pickup' : value === 'DELIVERY' && current.payment_method === 'pay_on_pickup' ? 'cod' : current.payment_method,
      };
      return { ...current, [name]: value };
    });
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
        county: formData.billing_county,
      };
      const shipping = sameAsBilling ? undefined : {
        first_name: formData.shipping_first_name,
        last_name: formData.shipping_last_name,
        address_1: formData.shipping_address_1,
        city: formData.shipping_city,
        county: formData.shipping_county,
        phone: formData.billing_phone,
      };
      const order = await checkoutService.createOrder({
        items: cartItems.map(item => ({ productId: item.product_id || item.id, quantity: item.quantity })),
        billing,
        shipping,
        notes: formData.order_notes,
        payment_method: formData.payment_method,
        payment_reference: formData.payment_reference,
        payment_message: paymentMessage,
        fulfillment_method: formData.fulfillment_method,
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
                  readOnly={!!user}
                  required
                />
                <Input
                  name="billing_last_name"
                  label="Last Name"
                  type="text"
                  value={formData.billing_last_name}
                  onChange={handleChange}
                  readOnly={!!user}
                  required
                />
                <Input
                  name="billing_email"
                  label="Email Address"
                  type="email"
                  value={formData.billing_email}
                  onChange={handleChange}
                  readOnly={!!user}
                  required
                />
                <EditableCheckoutInput
                  user={user} editingFields={editingFields} setEditingFields={setEditingFields}
                  name="billing_phone"
                  label="Phone Number"
                  type="tel"
                  value={formData.billing_phone}
                  onChange={handleChange}
                  required
                />
                <EditableCheckoutInput
                  user={user} editingFields={editingFields} setEditingFields={setEditingFields}
                  name="billing_address_1"
                  label="Street Address"
                  type="text"
                  value={formData.billing_address_1}
                  onChange={handleChange}
                  required={formData.fulfillment_method === 'DELIVERY'}
                  className="md:col-span-2"
                />
                <EditableCheckoutInput
                  user={user} editingFields={editingFields} setEditingFields={setEditingFields}
                  name="billing_city"
                  label="City"
                  type="text"
                  value={formData.billing_city}
                  onChange={handleChange}
                  required={formData.fulfillment_method === 'DELIVERY'}
                />
                <EditableCheckoutInput
                  user={user} editingFields={editingFields} setEditingFields={setEditingFields}
                  name="billing_county"
                  label="County"
                  type="text"
                  value={formData.billing_county}
                  onChange={handleChange}
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

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">How would you like to receive your order?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${formData.fulfillment_method === 'DELIVERY' ? 'border-[#4c00b0] bg-purple-50' : 'border-gray-200'}`}>
                  <input type="radio" name="fulfillment_method" value="DELIVERY" checked={formData.fulfillment_method === 'DELIVERY'} onChange={handleChange} />
                  <span><b className="block text-gray-900">Delivery</b><small className="text-gray-600">We deliver to your address.</small></span>
                </label>
                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${formData.fulfillment_method === 'PICKUP' ? 'border-[#4c00b0] bg-purple-50' : 'border-gray-200'}`}>
                  <input type="radio" name="fulfillment_method" value="PICKUP" checked={formData.fulfillment_method === 'PICKUP'} onChange={handleChange} />
                  <span><b className="block text-gray-900">Collect from the shop</b><small className="text-gray-600">Pay online or pay when you collect.</small></span>
                </label>
              </div>
            </div>

            {/* Shipping Details */}
            {formData.fulfillment_method === 'DELIVERY' && <div className="bg-white rounded-lg shadow-sm p-6">
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
                    readOnly={!!user}
                    required
                  />
                  <Input
                    name="shipping_last_name"
                    label="Last Name"
                    type="text"
                    value={formData.shipping_last_name}
                    onChange={handleChange}
                    readOnly={!!user}
                    required
                  />
                  <EditableCheckoutInput
                    user={user} editingFields={editingFields} setEditingFields={setEditingFields}
                    name="shipping_address_1"
                    label="Street Address"
                    type="text"
                    value={formData.shipping_address_1}
                    onChange={handleChange}
                    required
                    className="md:col-span-2"
                  />
                  <EditableCheckoutInput
                    user={user} editingFields={editingFields} setEditingFields={setEditingFields}
                    name="shipping_city"
                    label="City"
                    type="text"
                    value={formData.shipping_city}
                    onChange={handleChange}
                    required
                  />
                  <EditableCheckoutInput
                    user={user} editingFields={editingFields} setEditingFields={setEditingFields}
                    name="shipping_county"
                    label="County"
                    type="text"
                    value={formData.shipping_county}
                    onChange={handleChange}
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
            </div>}

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
                          onError={hideBrokenProductImage}
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
                  {formData.fulfillment_method === 'DELIVERY' && <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-[#4c00b0] transition-colors">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === 'cod'}
                      onChange={handleChange}
                      className="text-[#4c00b0] focus:ring-[#4c00b0]"
                    />
                    <span className="text-sm">Cash on Delivery</span>
                  </label>}
                  {formData.fulfillment_method === 'PICKUP' && <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-[#4c00b0] transition-colors">
                    <input type="radio" name="payment_method" value="pay_on_pickup" checked={formData.payment_method === 'pay_on_pickup'} onChange={handleChange} />
                    <span className="text-sm text-gray-900">Pay when collecting at the shop</span>
                  </label>}
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
                {formData.payment_method === 'mpesa' && (
                  <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-gray-800">
                    <p className="font-semibold">Pay by M-Pesa before {formData.fulfillment_method === 'PICKUP' ? 'collection' : 'delivery'}</p>
                    <p className="mt-1">Paybill: <span className="font-medium">400200</span></p>
                    <p>Account number: <span className="font-medium">851561</span></p>
                    <Input name="payment_reference" label="M-Pesa receipt code (optional)" value={formData.payment_reference} onChange={handleChange} placeholder="e.g. QWE123ABC" />
                    <label className="mt-3 block text-sm font-medium text-gray-700">Full M-Pesa confirmation message (optional)<textarea className="mt-1 min-h-28 w-full rounded-lg border border-gray-300 p-3 focus:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-200" value={paymentMessage} onChange={event => setPaymentMessage(event.target.value)} maxLength={5000} placeholder="Paste the complete SMS, including receipt code, amount, date and recipient." /></label>
                    <p className="mt-1 text-xs text-gray-600">You can place the order without pasting the SMS. An administrator will confirm receipt against the store’s M-Pesa records.</p>
                  </div>
                )}
                {formData.payment_method === 'pay_on_pickup' && <p className="mt-3 rounded-lg bg-amber-50 p-4 text-sm text-gray-800">Your items will be reserved for shop collection. The seller will record your payment when you arrive.</p>}
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
