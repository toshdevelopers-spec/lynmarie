import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Banknote, Barcode, Check, CreditCard, Minus, Package, Plus, Printer, RefreshCw, Search, ShoppingCart, Store, Trash2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/admin';

const cash = value => `KES ${Number(value || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const productPrice = product => Number(product.salePrice ?? product.price ?? 0);
const options = (product, attributeName) => [...new Set((product.attributes || []).filter(item => item.attribute?.name?.toLowerCase() === attributeName).map(item => item.value))];
const available = product => product.manageStock && product.stockQuantity != null ? Number(product.stockQuantity) : product.stockStatus === 'OUT_OF_STOCK' ? 0 : Infinity;
const time = value => new Date(value).toLocaleString('en-KE', { dateStyle: 'short', timeStyle: 'short' });

export default function SellerDashboard() {
  const { user, logout } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [pickupOrders, setPickupOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [activityTab, setActivityTab] = useState('sales');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [amountTendered, setAmountTendered] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [discountReason, setDiscountReason] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [collecting, setCollecting] = useState(null);
  const [collectMethod, setCollectMethod] = useState('CASH');
  const [collectReference, setCollectReference] = useState('');
  const [collectAmount, setCollectAmount] = useState('');
  const [receiptOrder, setReceiptOrder] = useState(null);
  const searchRef = useRef(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const from = await adminService.posSales(start.toISOString());
      const stock = await adminService.posInventory();
      setInventory(stock);
      setSales(from.sales || []);
      setPickupOrders(from.pickupOrders || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not load shop inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return inventory;
    return inventory.filter(product => [product.name, product.sku, product.barcode, String(product.id)].some(value => value?.toLowerCase?.().includes(term)));
  }, [inventory, search]);

  const subtotal = cart.reduce((sum, item) => sum + productPrice(item.product) * item.quantity, 0);
  const discount = Math.max(0, Math.min(subtotal, Number(discountAmount) || 0));
  const total = Math.max(0, subtotal - discount);
  const tendered = Number(amountTendered) || 0;
  const canComplete = cart.length > 0 && tendered >= total && (paymentMethod === 'CASH' || tendered === total) && (!['MPESA', 'BANK'].includes(paymentMethod) || paymentReference.trim()) && !busy;

  const addProduct = product => {
    if (!available(product)) return;
    const sizes = options(product, 'size');
    const colors = [...options(product, 'color'), ...options(product, 'colour')];
    const size = sizes[0] || '';
    const color = colors[0] || '';
    const key = `${product.id}|${size}|${color}`;
    setCart(current => {
      const found = current.find(item => item.key === key);
      if (found) return current.map(item => item.key === key ? { ...item, quantity: Math.min(item.quantity + 1, available(product)) } : item);
      return [...current, { key, product, quantity: 1, size, color }];
    });
    setSearch('');
    searchRef.current?.focus();
  };

  const scanOrSearch = event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const value = search.trim().toLowerCase();
    if (!value) return;
    const exact = inventory.find(product => [product.barcode, product.sku, String(product.id)].some(code => code?.toLowerCase() === value));
    const match = exact || filteredProducts[0];
    if (match) addProduct(match);
  };

  const updateCart = (key, update) => setCart(current => current.map(item => {
    if (item.key !== key) return item;
    const next = { ...item, ...update };
    next.key = `${next.product.id}|${next.size || ''}|${next.color || ''}`;
    if (next.key !== key && current.some(row => row.key === next.key)) return item;
    return next;
  }));
  const removeCartItem = key => setCart(current => current.filter(item => item.key !== key));
  const setQuantity = (item, quantity) => {
    if (quantity < 1) return removeCartItem(item.key);
    if (quantity > available(item.product)) return;
    updateCart(item.key, { quantity });
  };

  const completeSale = async event => {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await adminService.createPosSale({
        items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity, size: item.size || undefined, color: item.color || undefined })),
        customerName, customerPhone, paymentMethod, paymentReference: paymentReference || undefined,
        amountTendered: tendered, discountAmount: discount, discountReason: discountReason || undefined,
      });
      setReceiptOrder(result);
      setCart([]); setCustomerName(''); setCustomerPhone(''); setPaymentReference(''); setAmountTendered(''); setDiscountAmount('0'); setDiscountReason('');
      setNotice('Sale saved. Inventory has been updated.');
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not complete this sale.');
    } finally { setBusy(false); }
  };

  const collectPickup = async event => {
    event.preventDefault();
    if (!collecting) return;
    setBusy(true); setError('');
    try {
      const order = await adminService.collectPickup(collecting.id, { paymentMethod: collectMethod, paymentReference: collectReference || undefined, amountTendered: Number(collectAmount) });
      setReceiptOrder(order); setCollecting(null); setCollectReference(''); setCollectAmount('');
      setNotice('Payment recorded and the pickup order marked collected.');
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not record pickup payment.');
    } finally { setBusy(false); }
  };

  const printReceipt = () => window.print();
  const changeFor = order => Math.max(0, Number(order.amountTendered || order.amountPaid || 0) - Number(order.total || 0));

  return <div className="pos-page">
    <header className="pos-header"><div className="pos-brand"><span className="pos-brand-icon"><Store /></span><div><span>LYN MARIE BOUTIQUE</span><h1>Shop point of sale</h1></div></div><div className="pos-header-actions">{user?.role === 'ADMIN' && <Link to="/admin" className="pos-admin-link"><ArrowLeft size={17} /> Admin dashboard</Link>}<button className="pos-refresh" onClick={refresh} aria-label="Refresh POS"><RefreshCw size={17} /></button><button className="pos-logout" onClick={logout}>Sign out</button></div></header>
    <main className="pos-main">
      {error && <div className="pos-alert error" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss"><X size={17} /></button></div>}
      {notice && <div className="pos-alert success" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={17} /></button></div>}
      <section className="pos-stat-row"><article><span>Available styles</span><b>{inventory.length}</b><Package size={22} /></article><article><span>Shop sales today</span><b>{sales.length}</b><ShoppingCart size={22} /></article><article><span>Collected today</span><b>{cash(sales.reduce((sum, order) => sum + Number(order.total), 0))}</b><Banknote size={22} /></article><article className={pickupOrders.length ? 'attention' : ''}><span>Pickup orders to settle</span><b>{pickupOrders.length}</b><Store size={22} /></article></section>

      <div className="pos-layout">
        <section className="pos-inventory-panel">
          <div className="pos-section-title"><div><h2>Find clothing</h2><p>Scan a barcode or search by code, SKU, or item name.</p></div><span className="pos-inventory-count">{filteredProducts.length} results</span></div>
          <label className="pos-search"><Barcode size={23} /><input ref={searchRef} autoFocus value={search} onChange={event => setSearch(event.target.value)} onKeyDown={scanOrSearch} placeholder="Scan barcode or search clothes…" aria-label="Scan a barcode or search clothes" /><Search size={20} /></label>
          <div className="pos-product-list">{loading ? <p className="pos-empty">Loading inventory…</p> : filteredProducts.length ? filteredProducts.map(product => {
            const sizes = options(product, 'size');
            const colors = [...options(product, 'color'), ...options(product, 'colour')];
            const stock = available(product);
            const image = product.images?.[0]?.thumbnailUrl || product.images?.[0]?.url;
            return <article className={`pos-product ${stock === 0 ? 'unavailable' : ''}`} key={product.id}>
              {image ? <img src={image} alt="" onError={event => event.currentTarget.remove()} /> : <span className="pos-product-placeholder"><Package /></span>}
              <div className="pos-product-copy"><h3>{product.name}</h3><p>{product.barcode || product.sku || `Item #${product.id}`}</p><strong>{cash(productPrice(product))}</strong><small>{stock === Infinity ? 'Stock not tracked' : `${stock} available`}{sizes.length ? ` · ${sizes.length} sizes` : ''}{colors.length ? ` · ${colors.length} colors` : ''}</small></div>
              <button className="pos-add-button" onClick={() => addProduct(product)} disabled={stock === 0} aria-label={`Add ${product.name}`}><Plus /></button>
            </article>;
          }) : <p className="pos-empty">No matching clothes. Try the product name or barcode.</p>}</div>
        </section>

        <section className="pos-checkout-panel">
          <div className="pos-section-title"><div><h2>Current sale</h2><p>{cart.length} line {cart.length === 1 ? 'item' : 'items'}</p></div><ShoppingCart size={22} /></div>
          <div className="pos-cart-items">{cart.length ? cart.map(item => {
            const sizes = options(item.product, 'size');
            const colors = [...options(item.product, 'color'), ...options(item.product, 'colour')];
            return <article className="pos-cart-item" key={item.key}>
              <div className="pos-cart-item-heading"><div><b>{item.product.name}</b><small>{cash(productPrice(item.product))} each</small></div><button onClick={() => removeCartItem(item.key)} aria-label={`Remove ${item.product.name}`}><Trash2 size={17} /></button></div>
              <div className="pos-cart-item-options">{sizes.length > 0 && <label>Size<select value={item.size} onChange={event => updateCart(item.key, { size: event.target.value })}>{sizes.map(value => <option key={value}>{value}</option>)}</select></label>}{colors.length > 0 && <label>Color<select value={item.color} onChange={event => updateCart(item.key, { color: event.target.value })}>{colors.map(value => <option key={value}>{value}</option>)}</select></label>}</div>
              <div className="pos-cart-item-bottom"><div className="pos-quantity"><button onClick={() => setQuantity(item, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={15} /></button><b>{item.quantity}</b><button onClick={() => setQuantity(item, item.quantity + 1)} aria-label="Increase quantity" disabled={item.quantity >= available(item.product)}><Plus size={15} /></button></div><strong>{cash(productPrice(item.product) * item.quantity)}</strong></div>
            </article>;
          }) : <div className="pos-cart-empty"><ShoppingCart size={29} /><p>Scan or select an item to start the sale.</p></div>}</div>

          <form className="pos-payment-form" onSubmit={completeSale}>
            <div className="pos-customer-fields"><label>Customer name (optional)<input value={customerName} onChange={event => setCustomerName(event.target.value)} placeholder="Walk-in customer" /></label><label>Phone (optional)<input value={customerPhone} onChange={event => setCustomerPhone(event.target.value)} placeholder="07xx xxx xxx" /></label></div>
            <div className="pos-payment-methods" role="group" aria-label="Payment method">{[['CASH', Banknote, 'Cash'], ['CARD', CreditCard, 'Card'], ['MPESA', Store, 'M-Pesa'], ['BANK', CreditCard, 'Bank']].map(([value, Icon, label]) => <button type="button" key={value} className={paymentMethod === value ? 'selected' : ''} aria-pressed={paymentMethod === value} onClick={() => { setPaymentMethod(value); setPaymentReference(''); setAmountTendered(value === 'CASH' ? '' : total.toFixed(2)); }}><Icon size={17} />{label}</button>)}</div>
            {['MPESA', 'BANK'].includes(paymentMethod) && <label className="pos-field">{paymentMethod === 'MPESA' ? 'M-Pesa transaction code' : 'Bank transaction / reference code'}<input required value={paymentReference} onChange={event => setPaymentReference(event.target.value)} placeholder="Enter the payment reference" /></label>}
            <div className="pos-discount-row"><label>Discount (KES)<input type="number" min="0" max={subtotal} step="0.01" value={discountAmount} onChange={event => setDiscountAmount(event.target.value)} /></label><label>Discount reason<input value={discountReason} onChange={event => setDiscountReason(event.target.value)} placeholder="Optional" /></label></div>
            <div className="pos-total-box"><div><span>Subtotal</span><b>{cash(subtotal)}</b></div>{discount > 0 && <div><span>Discount</span><b>− {cash(discount)}</b></div>}<div className="due"><span>Amount due</span><b>{cash(total)}</b></div></div>
            <label className="pos-field">{paymentMethod === 'CASH' ? 'Cash received' : 'Amount paid'}<input required type="number" min={total} step="0.01" value={amountTendered} onChange={event => setAmountTendered(event.target.value)} placeholder={total.toFixed(2)} /></label>
            {paymentMethod === 'CASH' && tendered > total && <p className="pos-change">Change to return <b>{cash(tendered - total)}</b></p>}
            <button className="pos-complete-button" disabled={!canComplete || !cart.length}>{busy ? 'Saving sale…' : `Complete sale · ${cash(total)}`}</button>
          </form>
        </section>
      </div>

      <section className="pos-activity-panel"><div className="pos-activity-heading"><div><h2>Shop activity</h2><p>Sales and customer orders for collection at the shop.</p></div><div className="pos-tabs"><button className={activityTab === 'sales' ? 'selected' : ''} onClick={() => setActivityTab('sales')}>Today’s sales</button><button className={activityTab === 'pickups' ? 'selected' : ''} onClick={() => setActivityTab('pickups')}>Shop pickups <span>{pickupOrders.length}</span></button></div></div>
        {activityTab === 'sales' ? sales.length ? <div className="pos-table-wrap"><table><thead><tr><th>Receipt</th><th>Time</th><th>Customer</th><th>Items</th><th>Payment</th><th>Total</th><th /></tr></thead><tbody>{sales.map(order => <tr key={order.id}><td>{order.orderNumber}</td><td>{time(order.createdAt)}</td><td>{[order.billingFirstName, order.billingLastName].filter(Boolean).join(' ') || 'Walk-in'}</td><td>{order.items.map(item => `${item.productName}${item.variantDetails ? ` (${item.variantDetails})` : ''} ×${item.quantity}`).join(', ')}</td><td>{order.paymentMethod}{order.paymentReference && <small>{order.paymentReference}</small>}</td><td>{cash(order.total)}</td><td><button className="pos-print-button" onClick={() => setReceiptOrder(order)}><Printer size={16} /> Receipt</button></td></tr>)}</tbody></table></div> : <p className="pos-empty">No shop sales today yet.</p> : pickupOrders.length ? <div className="pos-pickup-list">{pickupOrders.map(order => <article key={order.id}><div><b>{order.orderNumber || `Order #${order.id}`}</b><span>{[order.billingFirstName, order.billingLastName].filter(Boolean).join(' ') || 'Customer'} · {order.billingPhone || 'No phone'}</span><small>{order.items.map(item => `${item.productName} ×${item.quantity}`).join(', ')}</small><small className={order.paymentStatus === 'PAID' ? 'pos-paid-label' : 'pos-due-label'}>{order.paymentStatus === 'PAID' ? `Already paid via ${order.paymentMethod || 'online'}` : 'Payment due at collection'}</small></div><strong>{cash(order.total)}</strong><button className="pos-pickup-button" onClick={() => { setCollecting(order); setCollectAmount(Number(order.total).toFixed(2)); setCollectReference(''); setCollectMethod('CASH'); }}>{order.paymentStatus === 'PAID' ? 'Mark collected & hand over' : 'Collect payment & hand over'}</button></article>)}</div> : <p className="pos-empty">No open shop collection orders.</p>}
      </section>
    </main>

    {collecting && <div className="pos-modal-backdrop" role="presentation"><form className="pos-collect-modal" onSubmit={collectPickup}><button type="button" className="pos-modal-close" onClick={() => setCollecting(null)} aria-label="Close"><X /></button><span className="pos-modal-eyebrow">SHOP PICKUP</span><h2>{collecting.paymentStatus === 'PAID' ? 'Hand over paid order' : 'Collect payment & order'}</h2><p>{collecting.orderNumber} · {cash(collecting.total)}{collecting.paymentStatus === 'PAID' ? ' already paid' : ' due'}</p>{collecting.paymentStatus !== 'PAID' && <><label>Payment method<select value={collectMethod} onChange={event => setCollectMethod(event.target.value)}><option value="CASH">Cash</option><option value="CARD">Card</option><option value="MPESA">M-Pesa</option><option value="BANK">Bank transfer</option></select></label>{['MPESA', 'BANK'].includes(collectMethod) && <label>{collectMethod === 'MPESA' ? 'M-Pesa code' : 'Bank reference'}<input required value={collectReference} onChange={event => setCollectReference(event.target.value)} /></label>}<label>Amount received<input required type="number" min={Number(collecting.total)} step="0.01" value={collectAmount} onChange={event => setCollectAmount(event.target.value)} /></label></>}<button className="pos-complete-button" disabled={busy}>{busy ? 'Recording…' : collecting.paymentStatus === 'PAID' ? 'Mark collected' : 'Mark paid and collected'}</button></form></div>}

    {receiptOrder && <div className="pos-modal-backdrop pos-receipt-backdrop"><article className="pos-receipt"><button className="pos-modal-close no-print" onClick={() => setReceiptOrder(null)} aria-label="Close receipt"><X /></button><div className="pos-receipt-brand">LYN MARIE BOUTIQUE</div><p className="pos-receipt-caption">SHOP RECEIPT</p><hr /><div className="pos-receipt-meta"><span>Receipt</span><b>{receiptOrder.orderNumber}</b><span>Date</span><b>{time(receiptOrder.createdAt || new Date())}</b><span>Served by</span><b>{receiptOrder.seller?.firstName || user?.first_name || user?.email}</b>{receiptOrder.billingPhone && <><span>Customer phone</span><b>{receiptOrder.billingPhone}</b></>}</div><hr /><div className="pos-receipt-lines">{receiptOrder.items?.map(item => <div key={item.id}><span>{item.productName}{item.variantDetails && <small>{item.variantDetails}</small>}<small>{item.quantity} × {cash(item.unitPrice)}</small></span><b>{cash(item.totalPrice)}</b></div>)}</div><hr /><div className="pos-receipt-total"><span>Subtotal</span><b>{cash(receiptOrder.subtotal)}</b>{Number(receiptOrder.discountTotal) > 0 && <><span>Discount</span><b>− {cash(receiptOrder.discountTotal)}</b></>}<strong>Total paid</strong><strong>{cash(receiptOrder.total)}</strong><span>Method</span><b>{receiptOrder.paymentMethod}</b>{receiptOrder.paymentReference && <><span>Reference</span><b>{receiptOrder.paymentReference}</b></>}{Number(receiptOrder.amountTendered) > Number(receiptOrder.total) && <><span>Change</span><b>{cash(changeFor(receiptOrder))}</b></>}</div><hr /><p className="pos-receipt-thanks">Thank you for shopping with Lyn Marie Boutique.</p><button className="pos-print-cta no-print" onClick={printReceipt}><Printer size={18} /> Print receipt</button></article></div>}
  </div>;
}
