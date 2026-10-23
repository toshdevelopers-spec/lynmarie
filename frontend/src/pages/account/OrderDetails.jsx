import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { checkoutService } from '../../services/checkout';
import { formatPrice } from '../../utils/formatPrice';

const title = value => String(value || 'pending').toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
const paymentName = value => ({ mpesa: 'M-Pesa', cod: 'Cash on delivery', pay_on_pickup: 'Pay at shop collection', CASH: 'Cash', CARD: 'Card', MPESA: 'M-Pesa', BANK: 'Bank transfer' }[value] || title(value));

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    checkoutService.getOrder(id).then(row => { if (active) setOrder(row); }).catch(err => { if (active) setError(err.response?.data?.message || 'Could not load this order.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <p className="py-10 text-gray-600">Loading order details…</p>;
  if (error || !order) return <section className="rounded-xl border border-gray-200 p-6"><p className="text-red-700">{error || 'Order not found.'}</p><Link className="mt-4 inline-block text-purple-800 underline" to="/my-account/orders">Back to my orders</Link></section>;

  const isPickup = order.fulfillmentMethod === 'PICKUP';
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><Link className="text-sm font-medium text-purple-800" to="/my-account/orders">← My orders</Link><h2 className="mt-2 text-2xl font-bold text-gray-900">Order {order.orderNumber || `#${order.id}`}</h2><p className="mt-1 text-sm text-gray-600">Placed {new Date(order.createdAt).toLocaleString()}</p></div><span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-900">{title(order.status)}</span></div>
    <section className="grid gap-4 sm:grid-cols-2">
      <article className="rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900">Payment</h3><p className="mt-3"><b>Method:</b> {paymentName(order.paymentMethod)}</p><p className="mt-1"><b>Payment status:</b> {title(order.paymentStatus)}</p>{order.paymentReference && <p className="mt-1"><b>Receipt code:</b> {order.paymentReference}</p>}<p className="mt-1"><b>Paid:</b> {formatPrice(order.amountPaid || 0)} <span className="text-gray-500">of {formatPrice(order.total)}</span></p>{order.paymentStatus === 'AWAITING_REVIEW' && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">We’re checking your M-Pesa payment and will update you when it is confirmed.</p>}{order.paymentStatus === 'REJECTED' && order.paymentReviewNote && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Payment update: {order.paymentReviewNote}</p>}</article>
      <article className="rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900">{isPickup ? 'Collection' : 'Delivery'}</h3>{isPickup ? <><p className="mt-3">Collect your order from the Lyn Marie Boutique shop.</p><p className="mt-1">Collection status: {order.pickedUpAt ? 'Collected' : 'Awaiting collection'}</p></> : <><p className="mt-3">Delivering to:</p><p className="mt-1 font-medium">{order.shippingAddress || 'Address not available'}</p>{order.shippingPhone && <p className="mt-1">Phone: {order.shippingPhone}</p>}</>}</article>
    </section>
    <section className="overflow-hidden rounded-xl border border-gray-200"><div className="border-b border-gray-200 bg-gray-50 px-5 py-4"><h3 className="font-semibold text-gray-900">Items in your order</h3></div><div className="divide-y divide-gray-100">{order.items?.map(item => <article key={item.id} className="flex items-start justify-between gap-4 px-5 py-4"><div><p className="font-medium text-gray-900">{item.productName}</p>{item.variantDetails && <p className="mt-1 text-sm text-gray-600">{item.variantDetails}</p>}<p className="mt-1 text-sm text-gray-600">Quantity: {item.quantity} × {formatPrice(item.unitPrice)}</p></div><b className="shrink-0">{formatPrice(item.totalPrice)}</b></article>)}</div><div className="flex justify-between bg-gray-50 px-5 py-4 text-lg"><b>Order total</b><b>{formatPrice(order.total)}</b></div></section>
  </div>;
}
