import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutDashboard, Shirt, Tags, Users, ShoppingBag, CreditCard, Star, MessageSquareText, Plus, Pencil, Archive, Check, LogOut, Menu, X, Search, RefreshCw, Trash2, Bell, Mail, ArrowUp, ArrowDown, Store, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/admin';
import Loader from '../../components/ui/Loader';

const navItems = [
  ['overview', 'Overview', LayoutDashboard], ['products', 'Products & stock', Shirt], ['new-arrivals', 'New Arrivals', Sparkles], ['categories', 'Categories', Tags], ['cart', 'Cart activity', ShoppingBag],
  ['customers', 'Customers & staff', Users], ['orders', 'Orders', ShoppingBag], ['payments', 'Payments', CreditCard], ['reviews', 'Reviews', Star], ['inquiries', 'Enquiries', MessageSquareText],
];
const emptyProduct = { name: '', description: '', shortDescription: '', sku: '', barcode: '', price: '', regularPrice: '', salePrice: '', stockQuantity: '1', categoryIds: [], images: [], attributes: [], metaTitle: '', metaDescription: '', featured: false, manageStock: true, status: 'PUBLISHED' };
const money = value => `KES ${Number(value || 0).toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;
const stamp = value => value ? new Date(value).toLocaleDateString() : '—';
const canReviewPayment = order => ['AWAITING_REVIEW', 'PENDING', 'REJECTED'].includes(order.paymentStatus) && (order.paymentMethod === 'mpesa' || (order.paymentMethod === 'cod' && order.deliveryPaymentConfirmedAt));
const canRecordPayment = order => ['AWAITING_REVIEW', 'PENDING', 'REJECTED'].includes(order.paymentStatus) && !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(order.status) && !(order.paymentMethod === 'cod' && order.fulfillmentMethod === 'DELIVERY' && !order.deliveryPaymentConfirmedAt) && !(order.paymentMethod === 'pay_on_pickup' && order.fulfillmentMethod === 'PICKUP' && !order.pickedUpAt);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState('overview');
  const [data, setData] = useState({});
  const [categories, setCategories] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [editing, setEditing] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [newArrivalIds, setNewArrivalIds] = useState([]);
  const [userForm, setUserForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'CUSTOMER' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingPaymentCount, setPendingPaymentCount] = useState(0);
  const sectionRequest = useRef(0);
  const activeSection = useRef('overview');

  const addNotification = useCallback(message => {
    setNotifications(items => [{ id: `${Date.now()}-${Math.random()}`, message, time: new Date() }, ...items].slice(0, 8));
    setUnreadNotifications(count => count + 1);
  }, []);

  const refresh = useCallback(async () => {
    const requestId = ++sectionRequest.current;
    const requestedSection = activeSection.current;
    setLoading(true); setError('');
    try {
      let nextData;
      let nextCategories;
      let nextArrivals;
      let nextStaff;
      let nextPaymentCount;
      if (requestedSection === 'overview') { nextData = await adminService.dashboard(); nextPaymentCount = nextData.counts?.paymentApprovals || 0; }
      else if (requestedSection === 'products') { const [rows, categoryRows] = await Promise.all([adminService.products(), adminService.categories()]); nextData = { rows }; nextCategories = categoryRows; }
      else if (requestedSection === 'new-arrivals') { const [rows, selection] = await Promise.all([adminService.products(), adminService.newArrivals()]); nextData = { rows }; nextArrivals = selection.selectedIds || []; }
      else if (requestedSection === 'cart') nextData = { rows: await adminService.cartActivity() };
      else if (requestedSection === 'categories') nextCategories = await adminService.categories();
      else if (requestedSection === 'customers') nextData = { rows: await adminService.customers() };
      else if (requestedSection === 'orders' || requestedSection === 'payments') {
        const [rows, people] = await Promise.all([adminService.orders(), requestedSection === 'orders' ? adminService.customers() : Promise.resolve([])]);
        nextPaymentCount = rows.filter(canReviewPayment).length;
        nextData = { rows };
        if (requestedSection === 'orders') nextStaff = people.filter(person => ['SELLER', 'ADMIN'].includes(person.role) && person.isActive);
      }
      else if (requestedSection === 'reviews') nextData = { rows: await adminService.reviews() };
      else if (requestedSection === 'inquiries') nextData = { rows: await adminService.inquiries() };
      if (requestId !== sectionRequest.current) return;
      if (nextData) setData(nextData);
      if (nextCategories) setCategories(nextCategories);
      if (nextArrivals) setNewArrivalIds(nextArrivals);
      if (nextStaff) setStaff(nextStaff);
      if (nextPaymentCount !== undefined) setPendingPaymentCount(nextPaymentCount);
    } catch (err) { if (requestId === sectionRequest.current) setError(err.response?.data?.message || 'Unable to load this section.'); }
    finally { if (requestId === sectionRequest.current) setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => refresh(), 0); return () => window.clearTimeout(timer); }, [refresh, section]);
  const run = async action => { setBusy(true); setNotice(''); setError(''); try { const result = await action(); setNotice(result?.message || 'Changes saved.'); addNotification('Your dashboard changes were saved.'); await refresh(); return true; } catch (err) { setError(err.response?.data?.message || err.message || 'Unable to save changes.'); return false; } finally { setBusy(false); } };

  useEffect(() => {
    let active = true;
    let previous = null;
    const checkForUpdates = async () => {
      try {
        const snapshot = await adminService.dashboard();
        if (!active) return;
        const counts = snapshot.counts || {};
        const orderUpdated = previous && snapshot.latestOrderUpdate !== previous.latestOrderUpdate;
        if (previous && counts.inquiries > previous.inquiries) addNotification('A new customer enquiry has arrived.');
        if (previous && counts.orders > previous.orders) addNotification('A new customer order has arrived.');
        if (previous && counts.cancelledOrders > previous.cancelledOrders) {
          addNotification('A customer cancelled an order.');
        }
        if (orderUpdated && ['orders', 'payments'].includes(section)) {
          addNotification('An order payment or status was updated.');
        }
        if (previous && ['orders', 'payments'].includes(section) && (orderUpdated || counts.cancelledOrders > previous.cancelledOrders)) refresh();
        previous = { inquiries: counts.inquiries || 0, orders: counts.orders || 0, cancelledOrders: counts.cancelledOrders || 0, latestOrderUpdate: snapshot.latestOrderUpdate || null };
      } catch { /* The active section shows connection errors when data is opened. */ }
    };
    checkForUpdates();
    const timer = window.setInterval(checkForUpdates, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, [addNotification, refresh, section]);
  const setSectionAndClose = key => { activeSection.current = key; sectionRequest.current += 1; setSection(key); setLoading(true); setError(''); setMobileNav(false); setEditing(null); setSearch(''); };
  const closeProductEditor = () => {
    productForm.images.forEach(image => { if (image.preview) URL.revokeObjectURL(image.preview); });
    setEditing(null);
  };

  const openProduct = product => {
    setEditing(product?.id || 'new');
    if (!product) { setProductForm(emptyProduct); return; }
    const attributes = Object.values((product.attributes || []).reduce((grouped, item) => {
      const name = item.attribute?.name || 'Attribute';
      grouped[name] ||= { name, values: [] };
      grouped[name].values.push(item.value);
      return grouped;
    }, {}));
    setProductForm({ name: product.name, description: product.description || '', shortDescription: product.shortDescription || '', sku: product.sku || '', barcode: product.barcode || '', price: String(product.price), regularPrice: String(product.regularPrice ?? product.price), salePrice: product.salePrice == null ? '' : String(product.salePrice), stockQuantity: String(product.stockQuantity ?? 0), categoryIds: product.categories?.map(x => x.categoryId || x.category?.id || x.id) || [], images: product.images?.map(i => ({ url: i.url, thumbnailUrl: i.thumbnailUrl })) || [], attributes, metaTitle: product.metaTitle || '', metaDescription: product.metaDescription || '', featured: product.featured, manageStock: product.manageStock, status: product.status });
  };
  const saveProduct = async e => {
    e.preventDefault();
    const fields = { ...productForm };
    delete fields.images;
    await run(async () => {
      const uploadedImages = [];
      for (const image of productForm.images) {
        uploadedImages.push(image.file ? await adminService.uploadProductImage(image.file) : image);
      }
      const imageFields = {
        imageUrls: uploadedImages.map(image => image.url),
        imageThumbnails: uploadedImages.map(image => image.thumbnailUrl || null),
      };
      const body = { ...fields, price: Number(productForm.salePrice || productForm.regularPrice || productForm.price), regularPrice: productForm.regularPrice ? Number(productForm.regularPrice) : null, salePrice: productForm.salePrice ? Number(productForm.salePrice) : null, stockQuantity: Number(productForm.stockQuantity), categoryIds: productForm.categoryIds.map(Number), ...imageFields };
      if (editing === 'new') await adminService.createProduct(body); else await adminService.updateProduct(editing, body);
      productForm.images.forEach(image => { if (image.preview) URL.revokeObjectURL(image.preview); });
      setEditing(null);
    });
  };
  const saveUser = async e => { e.preventDefault(); await run(async () => { await adminService.createUser(userForm); setUserForm({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'CUSTOMER' }); }); };
  const saveNewArrivals = () => run(() => adminService.saveNewArrivals(newArrivalIds));
  const confirmPayment = (order, details) => run(() => adminService.reviewOrderPayment(order.id, details));
  const filtered = rows => (rows || []).filter(row => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));

  return <div className="admin-shell">
    <aside className={`admin-sidebar ${mobileNav ? 'is-open' : ''}`}>
      <div className="admin-brand"><span className="admin-brand-mark">LM</span><span><b>LynMarie</b><small>STORE ADMIN</small></span><button className="admin-mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={19} /></button></div>
      <div className="admin-nav-label">MANAGE STORE</div>
      <nav className="admin-nav">{navItems.map(([key, label, Icon]) => <button key={key} className={section === key ? 'active' : ''} onClick={() => setSectionAndClose(key)}><Icon size={18} /><span>{label}</span>{key === 'inquiries' && data.counts?.inquiries > 0 && <i>{data.counts.inquiries}</i>}{key === 'payments' && pendingPaymentCount > 0 && <i>{pendingPaymentCount}</i>}</button>)}</nav>
      <div className="admin-sidebar-bottom"><div className="admin-person"><span>{(user?.first_name || user?.email || 'A').slice(0, 1).toUpperCase()}</span><div><b>{user?.first_name || 'Administrator'}</b><small>{user?.email}</small></div></div><button onClick={logout}><LogOut size={17} /> Sign out</button></div>
    </aside>
    {mobileNav && <button className="admin-scrim" aria-label="Close admin navigation" onClick={() => setMobileNav(false)} />}
    <main className="admin-main">
      <header className="admin-topbar">
        <button className="admin-menu-toggle" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu /></button>
        <div><span>Store management</span><h1>{navItems.find(([key]) => key === section)?.[1]}</h1></div>
        <div className="admin-top-actions">
          <Link to="/" className="admin-pos-link admin-store-link" aria-label="Go to the LynMarie website" title="View website"><ExternalLink size={16} /><span>View website</span></Link>
          <Link to="/seller" className="admin-pos-link"><Store size={16} /><span>Shop POS</span></Link>
          <span className="admin-live"><i /> Store is live</span>
          <div className="admin-notification-wrap"><button onClick={() => { setNotificationsOpen(open => !open); setUnreadNotifications(0); }} aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ''}`} aria-expanded={notificationsOpen}><Bell size={17} />{unreadNotifications > 0 && <i className="admin-notification-count">{unreadNotifications}</i>}</button>{notificationsOpen && <section className="admin-notification-panel"><div className="admin-notification-heading"><b>Updates</b><span>Live</span></div>{notifications.length ? notifications.map(item => <article key={item.id}><p>{item.message}</p><small>{item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></article>) : <p className="admin-notification-empty">New enquiries, orders, and saved changes will appear here.</p>}</section>}</div>
          <button onClick={refresh} aria-label="Refresh data"><RefreshCw size={17} /></button>
        </div>
      </header>
      <section className="admin-content">
        {notice && <div className="admin-notice">{notice}</div>}{error && <div className="admin-error">{error}</div>}
        {loading ? <div className="admin-loading"><Loader size="large" /></div> : <>
          {section === 'overview' && <Overview data={data} onGo={setSectionAndClose} />}
          {section === 'products' && <>
            <div className="admin-toolbar"><div><h2>Product catalogue</h2><p>Manage product details, visibility, pricing and live inventory.</p></div><button className="admin-primary" onClick={() => openProduct(null)}><Plus size={17} /> Add product</button></div>
            {editing && <ProductEditor form={productForm} setForm={setProductForm} categories={categories} isEditing={editing !== 'new'} close={closeProductEditor} save={saveProduct} busy={busy} />}
            <SearchBox value={search} setValue={setSearch} />
            <div className="admin-table-wrap"><table><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>SEO</th><th /></tr></thead><tbody>{filtered(data.rows).map(p => <tr key={p.id}><td><div className="admin-product-cell"><img src={p.images?.[0]?.url || '/logo.webp'} alt="" /><div><b>{p.name}</b><small>{p.barcode || p.sku || 'No scan code'} · {p.categories?.map(c => c.category?.name || c.name).join(', ') || 'Uncategorised'}</small></div></div></td><td>{p.salePrice ? <><b>{money(p.salePrice)}</b><del>{money(p.regularPrice)}</del></> : money(p.price)}</td><td>{p.manageStock ? `${p.stockQuantity ?? 0} units` : 'Not tracked'}</td><td><span className={`admin-badge ${p.status === 'PUBLISHED' ? 'good' : 'muted'}`}>{p.status}</span></td><td>{p.metaTitle || p.metaDescription ? 'Set' : 'Missing'}</td><td className="admin-row-actions"><button aria-label="Edit product" onClick={() => openProduct(p)}><Pencil size={16} /></button><button aria-label="Remove product" onClick={() => run(() => adminService.deleteProduct(p.id))}><Archive size={16} /></button></td></tr>)}</tbody></table>{!data.rows?.length && <Empty message="No products found." />}</div>
          </>}
          {section === 'new-arrivals' && <NewArrivalsManager products={data.rows || []} selectedIds={newArrivalIds} setSelectedIds={setNewArrivalIds} search={search} setSearch={setSearch} save={saveNewArrivals} busy={busy} />}
          {section === 'cart' && <><SectionHeader title="Cart activity" caption="Recent items shoppers added to their baskets. Signed-in shoppers are linked to their customer profile." /><div className="admin-table-wrap"><table><thead><tr><th>Item</th><th>Customer</th><th>Email</th><th>Quantity</th><th>Added</th></tr></thead><tbody>{data.rows?.map(event => { const name = [event.user?.firstName, event.user?.lastName].filter(Boolean).join(' '); return <tr key={event.id}><td><div className="admin-product-cell"><img src={event.product?.images?.[0]?.url || '/logo.webp'} alt="" /><div><b>{event.product?.name || 'Product no longer listed'}</b><small>{event.product?.sku || 'SKU unavailable'}</small></div></div></td><td>{name || (event.user ? 'Customer' : `Guest · ${event.visitorId.slice(-6)}`)}</td><td>{event.user?.email || 'Not provided'}</td><td>{event.metadata?.quantity || 1}</td><td>{stamp(event.createdAt)}</td></tr>; })}</tbody></table>{!data.rows?.length && <Empty message="Cart additions will show here as visitors shop." />}</div></>}
          {section === 'payments' && <><SectionHeader title="Payment records" caption="Choose any order to attach cash, M-Pesa, bank, or card payment details. Approving payment moves it to Processing; update it to Completed from Orders after fulfilment." /><SearchBox value={search} setValue={setSearch} /><PaymentQueue rows={filtered(data.rows)} busy={busy} onApprove={confirmPayment} /></>}
          {section === 'categories' && <><div className="admin-toolbar"><div><h2>Shop categories</h2><p>Organise products so shoppers can browse the right collections.</p></div></div><form className="admin-inline-form" onSubmit={e => { e.preventDefault(); run(async () => { if (editingCategory) await adminService.updateCategory(editingCategory, categoryForm); else await adminService.createCategory(categoryForm); setCategoryForm({ name: '', description: '' }); setEditingCategory(null); }); }}><input placeholder="Category name" required value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} /><input placeholder="Short description" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} /><button className="admin-primary">{editingCategory ? <Pencil size={16} /> : <Plus size={16} />}{editingCategory ? ' Save category' : ' Add category'}</button></form><div className="admin-category-grid">{categories.map(c => <article key={c.id}><span><Tags size={19} /></span><div className="admin-category-info"><b>{c.name}</b><small>/{c.slug} · {c._count?.products || 0} products</small></div><button className="admin-category-action" title="Edit category" onClick={() => { setEditingCategory(c.id); setCategoryForm({ name: c.name, description: c.description || '' }); }}><Pencil size={14} /></button>{!c._count?.products && <button className="admin-category-action" title="Delete empty category" onClick={() => run(() => adminService.deleteCategory(c.id))}><Trash2 size={14} /></button>}</article>)}</div></>}
          {section === 'customers' && <><div className="admin-toolbar"><div><h2>Customers & staff</h2><p>Review customer accounts, control access and add team members.</p></div></div><form className="admin-user-form" onSubmit={saveUser}><input placeholder="First name" value={userForm.firstName} onChange={e => setUserForm({ ...userForm, firstName: e.target.value })} /><input placeholder="Last name" value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} /><input type="email" placeholder="Email address" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} /><input type="tel" placeholder="Phone (optional)" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} /><input type="password" minLength={12} maxLength={72} placeholder="Temporary password (12+ chars)" required value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} /><select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}><option value="CUSTOMER">Customer</option><option value="SELLER">Shop seller</option>{user?.email?.toLowerCase() === 'adelewigitz@gmail.com' && <option value="ADMIN">Administrator</option>}</select><button className="admin-primary"><Plus size={16} /> Add user</button></form><SearchBox value={search} setValue={setSearch} /><div className="admin-table-wrap"><table><thead><tr><th>Customer / staff</th><th>Contact</th><th>Orders</th><th>Joined</th><th>Role</th><th>Access</th><th /></tr></thead><tbody>{filtered(data.rows).map(c => <tr key={c.id}><td><b>{[c.firstName, c.lastName].filter(Boolean).join(' ') || 'Customer'}</b><small>{c.role}</small></td><td>{c.email}<small>{c.phone || 'No phone added'}</small></td><td>{c._count?.orders || 0}</td><td>{stamp(c.createdAt)}</td><td>{user?.email?.toLowerCase() === 'adelewigitz@gmail.com' && c.email?.toLowerCase() !== 'adelewigitz@gmail.com' ? <select aria-label={`Role for ${c.email}`} value={c.role} onChange={e => run(() => adminService.updateUser(c.id, { role: e.target.value }))}><option value="CUSTOMER">Customer</option><option value="SELLER">Shop seller</option><option value="ADMIN">Administrator</option></select> : <span className="admin-badge muted">{c.role}</span>}</td><td><span className={`admin-badge ${c.isActive ? 'good' : 'muted'}`}>{c.isActive ? 'Active' : 'Disabled'}</span></td><td className="admin-row-actions"><button title={`Email a password reset link to ${c.email}`} disabled={busy} onClick={() => run(() => adminService.sendUserPasswordReset(c.id))}><Mail size={16} /></button>{c.email !== 'adelewigitz@gmail.com' && <button title={c.isActive ? 'Disable account' : 'Enable account'} onClick={() => run(() => adminService.updateUser(c.id, { isActive: !c.isActive }))}>{c.isActive ? <Archive size={16} /> : <Check size={16} />}</button>}</td></tr>)}</tbody></table></div></>}
          {section === 'orders' && <><SectionHeader title="Orders" caption="Online orders, shop pickups, and in-store POS sales. Review payment and collection status." /><SearchBox value={search} setValue={setSearch} /><div className="admin-table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total / paid</th><th>Fulfilment</th><th>Date</th><th>Status</th></tr></thead><tbody>{filtered(data.rows).map(o => <tr key={o.id}><td><b>{o.orderNumber || `#${o.id}`}</b><small>{o.orderType === 'POS' ? 'In-store POS' : o.paymentMethod || 'Payment pending'} · {o.paymentStatus || 'PENDING'}</small>{o.paymentReference && <small>Receipt code: {o.paymentReference}</small>}{o.paymentMessage && <details><summary>Full M-Pesa message</summary><pre style={{whiteSpace:'pre-wrap',maxWidth:320}}>{o.paymentMessage}</pre></details>}{o.paymentReviewNote && <small>Review note: {o.paymentReviewNote}</small>}</td><td>{o.billingFirstName} {o.billingLastName}<small>{o.user ? `Account: ${o.user.email}` : `Guest checkout · ${o.billingEmail}`}</small>{o.seller && <small>Seller: {[o.seller.firstName, o.seller.lastName].filter(Boolean).join(' ') || o.seller.email}</small>}</td><td>{o.items?.map(i => `${i.productName} ×${i.quantity}${i.variantDetails ? ` (${i.variantDetails})` : ''}`).join(', ')}</td><td><b>{money(o.total)}</b><small>Paid: {money(o.amountPaid ?? 0)}{o.amountTendered != null ? ` · Tendered ${money(o.amountTendered)}` : ''}</small>{Number(o.discountTotal || 0) > 0 && <small>Discount: {money(o.discountTotal)}{o.discountReason ? ` · ${o.discountReason}` : ''}</small>}</td><td>{o.fulfillmentMethod === 'PICKUP' ? 'Shop pickup' : o.fulfillmentMethod === 'IN_STORE' ? 'In store' : 'Delivery'}<small>{o.pickedUpAt ? `Collection confirmed ${new Date(o.pickedUpAt).toLocaleString()}` : o.fulfillmentMethod === 'PICKUP' ? 'Awaiting seller collection confirmation' : ''}{o.deliveryRider && <small>Rider: {[o.deliveryRider.firstName,o.deliveryRider.lastName].filter(Boolean).join(' ') || o.deliveryRider.email}</small>}{o.deliveryPaymentConfirmedAt && <small>Rider reported {money(o.deliveryPaymentAmount)} received</small>}</small></td><td>{stamp(o.createdAt)}</td><td>{o.fulfillmentMethod === 'DELIVERY' && o.paymentMethod === 'cod' && o.paymentStatus !== 'PAID' && <select aria-label={`Assign rider to ${o.orderNumber}`} value={o.deliveryRiderId || ''} onChange={e => run(() => adminService.assignDeliveryRider(o.id, e.target.value ? Number(e.target.value) : null))}><option value=''>Assign rider…</option>{staff.map(rider => <option key={rider.id} value={rider.id}>{[rider.firstName,rider.lastName].filter(Boolean).join(' ') || rider.email}</option>)}</select>}{['AWAITING_REVIEW','PENDING','REJECTED'].includes(o.paymentStatus) && (o.paymentMethod === 'mpesa' || o.deliveryPaymentConfirmedAt || (o.fulfillmentMethod === 'PICKUP' && o.paymentMethod === 'pay_on_pickup')) && <div className='flex gap-1'><button className='admin-primary' disabled={busy} onClick={() => { const reference = o.paymentMethod === 'mpesa' ? window.prompt('Optional M-Pesa receipt code. Leave blank if confirming from the M-Pesa message you received.') : undefined; if (reference !== null) confirmPayment(o, { paymentMethod: o.paymentMethod === 'mpesa' ? 'mpesa' : 'cash', amountReceived: Number(o.total), reference: reference || undefined }); }}>{o.paymentMethod === 'mpesa' ? 'Confirm M-Pesa received' : 'Approve payment'}</button><button className='admin-secondary' disabled={busy} onClick={() => { const note = window.prompt('Reason for holding/rejecting this payment?'); if (note?.trim()) run(() => adminService.reviewOrderPayment(o.id, { decision: 'REJECT', note })); }}>Hold</button></div>}<select value={o.status} onChange={e => run(() => adminService.setOrderStatus(o.id, e.target.value))}>{['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED'].map(s => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table>{!data.rows?.length && <Empty message="Orders will appear here after checkout." />}</div></>}
          {section === 'reviews' && <><SectionHeader title="Customer reviews" caption="New reviews appear on the shop immediately. Remove any review here whenever needed." /><div className="admin-review-grid">{filtered(data.rows).map(r => <article key={r.id}><div className="admin-review-top"><b>{r.reviewer}</b><span>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span></div><small>{r.product?.name || 'Store review'} · {stamp(r.createdAt)}</small><p>{r.review}</p><div className="flex gap-2">{!r.approved && <button className="admin-primary" onClick={() => run(() => adminService.approveReview(r.id, true))}><Check size={16} /> Publish review</button>}<button className="admin-secondary" onClick={() => { if (window.confirm('Delete this review permanently?')) run(() => adminService.deleteReview(r.id)); }}><Trash2 size={16} /> Delete review</button></div></article>)}</div>{!data.rows?.length && <Empty message="No reviews have been submitted." />}</>}
          {section === 'inquiries' && <><SectionHeader title="Enquiries" caption="Messages submitted through the contact form." /><div className="admin-inquiry-list">{filtered(data.rows).map(item => <article key={item.id}><div><b>{item.name}</b><a href={`mailto:${item.email}`}>{item.email}</a><p>{item.message}</p><small>{stamp(item.createdAt)}</small></div><select value={item.status} onChange={e => run(() => adminService.updateInquiry(item.id, e.target.value))}>{['NEW', 'IN_PROGRESS', 'RESOLVED'].map(s => <option key={s}>{s}</option>)}</select></article>)}</div>{!data.rows?.length && <Empty message="No enquiries yet." />}</>}
        </>}
      </section>
    </main>
  </div>;
}

function Overview({ data, onGo }) {
  const counts = data.counts || {};
  return <><div className="admin-welcome"><div><span>YOUR STORE AT A GLANCE</span><h2>A little overview goes a long way.</h2><p>Here’s what’s happening across your boutique today.</p></div><div className="admin-welcome-ornament">✳</div></div><div className="admin-stat-grid">{[['Products', counts.products, Shirt, 'products'], ['Customers', counts.customers, Users, 'customers'], ['Orders', counts.orders, ShoppingBag, 'orders'], ['Frequent visitors', counts.visitors, LayoutDashboard, 'overview'], ['Cart additions', counts.cartAdds, ShoppingBag, 'cart'], ['Low stock', counts.lowStock, Archive, 'products'], ['Reviews', counts.reviews, Star, 'reviews'], ['Enquiries', counts.inquiries, MessageSquareText, 'inquiries']].map(([label, value, Icon, key]) => <button className="admin-stat" key={label} onClick={() => onGo(key)}><span><Icon size={18} /></span><small>{label}</small><b>{value ?? 0}</b></button>)}</div><div className="admin-overview-grid"><section className="admin-panel"><div className="admin-panel-heading"><div><h3>Recent orders</h3><p>Most recent customer purchases</p></div><button onClick={() => onGo('orders')}>View all</button></div>{data.recentOrders?.length ? data.recentOrders.slice(0, 5).map(o => <div className="admin-mini-row" key={o.id}><span className="admin-mini-icon"><ShoppingBag size={16} /></span><div><b>{o.orderNumber || `Order #${o.id}`}</b><small>{o.billingFirstName} {o.billingLastName} · {stamp(o.createdAt)}</small></div><strong>{money(o.total)}</strong></div>) : <Empty message="No orders yet." />}</section><section className="admin-panel"><div className="admin-panel-heading"><div><h3>Frequent visitors</h3><p>Repeat visits recorded on this device</p></div></div>{data.frequentVisitors?.length ? data.frequentVisitors.slice(0, 6).map((v, i) => <div className="admin-mini-row" key={v.visitorId}><span className="admin-rank">{String(i+1).padStart(2, '0')}</span><div><b>Visitor {v.visitorId.slice(-6)}</b><small>Last active {stamp(v._max?.createdAt)}</small></div><strong>{v._count?.id || 0} visits</strong></div>) : <Empty message="Visitor activity appears as shoppers browse." />}</section></div></>;
}
function SectionHeader({ title, caption }) { return <div className="admin-toolbar"><div><h2>{title}</h2><p>{caption}</p></div></div>; }
function SearchBox({ value, setValue }) { return <label className="admin-search"><Search size={17} /><input value={value} onChange={e => setValue(e.target.value)} placeholder="Search this list" /></label>; }
function NewArrivalsManager({ products, selectedIds, setSelectedIds, search, setSearch, save, busy }) {
  const selectedProducts = selectedIds.map(id => products.find(product => product.id === id)).filter(Boolean);
  const selected = new Set(selectedIds);
  const candidates = products.filter(product => product.status === 'PUBLISHED' && !selected.has(product.id) && JSON.stringify(product).toLowerCase().includes(search.toLowerCase()));
  const move = (index, direction) => setSelectedIds(ids => {
    const next = [...ids];
    const target = index + direction;
    if (target < 0 || target >= next.length) return ids;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });

  return <>
    <div className="admin-toolbar"><div><h2>Homepage New Arrivals</h2><p>Choose up to 8 published products, set their order, and save the list shown on your homepage.</p></div><button className="admin-primary" onClick={save} disabled={busy}>Save New Arrivals</button></div>
    <section className="admin-panel new-arrivals-selection">
      <div className="admin-panel-heading"><div><h3>Selected products <span className="new-arrivals-count">{selectedIds.length}/8</span></h3><p>Use the arrows to change display order. Remove items whenever you like.</p></div>{selectedIds.length > 0 && <button onClick={() => setSelectedIds([])}>Clear all</button>}</div>
      {selectedProducts.length ? <div className="new-arrivals-selected-list">{selectedProducts.map((product, index) => <article className="new-arrivals-selected-item" key={product.id}>
        <span className="new-arrivals-rank">{index + 1}</span><img src={product.images?.[0]?.thumbnailUrl || product.images?.[0]?.url || '/logo.webp'} alt="" />
        <div className="new-arrivals-product-copy"><b>{product.name}</b><small>{product.sku || `Product #${product.id}`} · {money(product.salePrice ?? product.price)}</small></div>
        <div className="new-arrivals-item-actions"><button aria-label={`Move ${product.name} up`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={15} /></button><button aria-label={`Move ${product.name} down`} disabled={index === selectedIds.length - 1} onClick={() => move(index, 1)}><ArrowDown size={15} /></button><button aria-label={`Remove ${product.name} from New Arrivals`} onClick={() => setSelectedIds(ids => ids.filter(id => id !== product.id))}><Trash2 size={15} /></button></div>
      </article>)}</div> : <Empty message="No products selected. Add published products below, or save an empty list to clear New Arrivals from the homepage." />}
    </section>
    <div className="new-arrivals-catalog-heading"><div><h3>Add from your product catalogue</h3><p>{selectedIds.length >= 8 ? 'You have reached the 8 product limit.' : 'Only published products can be added.'}</p></div><SearchBox value={search} setValue={setSearch} /></div>
    <div className="new-arrivals-candidate-grid">{candidates.map(product => <article className="new-arrivals-candidate" key={product.id}>
      <img src={product.images?.[0]?.thumbnailUrl || product.images?.[0]?.url || '/logo.webp'} alt="" /><div className="new-arrivals-product-copy"><b>{product.name}</b><small>{product.sku || `Product #${product.id}`} · {money(product.salePrice ?? product.price)}</small></div>
      <button className="admin-secondary" disabled={selectedIds.length >= 8} onClick={() => setSelectedIds(ids => [...ids, product.id])}><Plus size={14} /> Add</button>
    </article>)}{!candidates.length && <Empty message={search ? 'No other published products match your search.' : 'There are no other published products to add.'} />}</div>
  </>;
}
function PaymentQueue({ rows, busy, onApprove }) {
  const [selected, setSelected] = useState(null);
  const [method, setMethod] = useState('mpesa');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const open = order => {
    setSelected(order);
    const existingMethod = String(order.paymentMethod || '').toLowerCase();
    setMethod(['mpesa', 'bank', 'card'].includes(existingMethod) ? existingMethod : 'cash');
    setAmount(String(Number(order.total)));
    setReference(order.paymentReference || '');
    setMessage(order.paymentMessage || '');
  };
  const submit = async event => {
    event.preventDefault();
    if (!selected) return;
    const saved = await onApprove(selected, { paymentMethod: method, amountReceived: Number(amount), reference: reference.trim() || undefined, message: message.trim() || undefined });
    if (saved) setSelected(null);
  };
  return <>
    <div className="admin-table-wrap"><table><thead><tr><th>Order / customer</th><th>Payment record</th><th>Amount</th><th>Fulfilment</th><th>Payment status</th><th>Action</th></tr></thead><tbody>{rows.map(order => <tr key={order.id}>
      <td><b>{order.orderNumber || `#${order.id}`}</b><small>{[order.billingFirstName, order.billingLastName].filter(Boolean).join(' ') || 'Customer'} · {order.billingEmail || order.user?.email}</small><small>{stamp(order.createdAt)}</small></td>
      <td><b>{order.paymentMethod === 'mpesa' ? 'M-Pesa' : order.paymentMethod || 'Not recorded'}</b>{order.paymentReference && <small>Receipt: {order.paymentReference}</small>}{order.paymentMessage && <details><summary>View M-Pesa message</summary><pre style={{ whiteSpace: 'pre-wrap', maxWidth: 340 }}>{order.paymentMessage}</pre></details>}</td>
      <td><b>{money(order.total)}</b><small>Paid: {money(order.amountPaid)}{order.amountTendered != null ? ` · Received ${money(order.amountTendered)}` : ''}</small></td>
      <td>{order.fulfillmentMethod === 'PICKUP' ? 'Shop collection' : order.fulfillmentMethod === 'IN_STORE' ? 'In store' : 'Delivery'}{order.deliveryPaymentConfirmedAt && <small>Rider confirmed {money(order.deliveryPaymentAmount)}</small>}</td>
      <td>{order.paymentStatus}<small>Order: {order.status}</small></td>
      <td>{order.paymentStatus === 'PAID' ? <span className="admin-badge good">Approved</span> : canRecordPayment(order) ? <button className="admin-primary" disabled={busy} onClick={() => open(order)}>Record / approve payment</button> : <span className="admin-badge muted">{['CANCELLED', 'REFUNDED'].includes(order.status) ? 'Closed' : 'Awaiting rider or seller confirmation'}</span>}</td>
    </tr>)}</tbody></table>{!rows.length && <Empty message="No orders match this search." />}</div>
    {selected && <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4" role="presentation"><form className="admin-editor m-0 max-h-[90vh] w-full max-w-2xl overflow-y-auto" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="payment-record-title">
      <div className="admin-editor-heading"><div><h3 id="payment-record-title">Record payment · {selected.orderNumber || `#${selected.id}`}</h3><p>Customer: {[selected.billingFirstName, selected.billingLastName].filter(Boolean).join(' ') || selected.billingEmail}</p><p>Order total: <b>{money(selected.total)}</b></p></div><button type="button" className="admin-close" onClick={() => setSelected(null)} aria-label="Close payment form">×</button></div>
      <div className="admin-form-grid"><label>Payment method<select required value={method} onChange={event => setMethod(event.target.value)}><option value="mpesa">M-Pesa</option><option value="cash">Cash</option><option value="bank">Bank transfer</option><option value="card">Card</option></select></label><label>Amount received (KES)<input required type="number" min={Number(selected.total)} step="0.01" value={amount} onChange={event => setAmount(event.target.value)} /></label><label className="span-two">Receipt / transaction code (optional)<input maxLength={100} value={reference} onChange={event => setReference(event.target.value)} placeholder="Enter the M-Pesa or bank reference" /></label>{method === 'mpesa' && <label className="span-two">Full M-Pesa message (optional)<textarea maxLength={5000} rows="5" value={message} onChange={event => setMessage(event.target.value)} placeholder="Paste the full M-Pesa confirmation message to attach it to this order." /></label>}</div>
      <div className="admin-editor-actions"><button type="button" className="admin-secondary" onClick={() => setSelected(null)}>Cancel</button><button className="admin-primary" disabled={busy}>{busy ? 'Saving payment…' : 'Approve payment'}</button></div>
    </form></div>}
  </>;
}
function Empty({ message }) { return <div className="admin-empty">{message}</div>; }
function ProductEditor({ form, setForm, categories, isEditing, close, save, busy }) {
  const [photoError, setPhotoError] = useState('');
  const patch = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const patchAttribute = (name, text) => {
    const values = text.split(',').map(value => value.trim()).filter(Boolean);
    const found = form.attributes.some(attribute => attribute.name.toLowerCase() === name.toLowerCase());
    patch('attributes', found
      ? form.attributes.map(attribute => attribute.name.toLowerCase() === name.toLowerCase() ? { ...attribute, values } : attribute)
      : [...form.attributes, { name, values }]);
  };
  const attributeText = name => form.attributes.find(attribute => attribute.name.toLowerCase() === name.toLowerCase())?.values.join(', ') || '';
  const addPhotos = event => {
    const files = [...event.target.files];
    if (form.images.length + files.length > 30) {
      setPhotoError('A product can have up to 30 photos. Remove a photo before adding more.');
      event.target.value = '';
      return;
    }
    setPhotoError('');
    patch('images', [...form.images, ...files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      key: `${file.name}-${file.lastModified}-${Math.random()}`,
    }))]);
    event.target.value = '';
  };
  const movePhoto = (index, direction) => {
    const next = [...form.images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    patch('images', next);
  };
  const removePhoto = index => {
    const photo = form.images[index];
    if (photo?.preview) URL.revokeObjectURL(photo.preview);
    patch('images', form.images.filter((_, i) => i !== index));
  };
  return <form className="admin-editor" onSubmit={save}><div className="admin-editor-heading"><div><h3>{isEditing ? 'Edit product' : 'Add a product'}</h3><p>Changes publish to the storefront immediately when status is Published.</p></div><button type="button" className="admin-close" onClick={close}>×</button></div><div className="admin-form-grid">
    <label>Product name<input required value={form.name} onChange={e => patch('name', e.target.value)} /></label><label>SKU<input value={form.sku} onChange={e => patch('sku', e.target.value)} /></label>
    <label>Barcode / scan code<div className="admin-code-input"><input value={form.barcode} onChange={e => patch('barcode', e.target.value)} placeholder="Enter or generate a code" /><button type="button" onClick={() => patch('barcode', `${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`)}>Generate</button></div></label>
    <label>Regular price (KES)<input required type="number" min="0" step="0.01" value={form.regularPrice} onChange={e => patch('regularPrice', e.target.value)} /></label><label>Sale price (optional)<input type="number" min="0" step="0.01" value={form.salePrice} onChange={e => patch('salePrice', e.target.value)} /></label>
    <label>Available quantity<input required type="number" min="0" step="1" inputMode="numeric" value={form.stockQuantity} onChange={e => patch('stockQuantity', e.target.value)} /><small>Number of units currently in stock.</small></label><label>Visibility<select value={form.status} onChange={e => patch('status', e.target.value)}><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="PRIVATE">Hidden</option></select></label>
    <div className="span-two admin-category-select"><span>Product categories</span><div className="admin-category-options">{categories.map(category => <label className="admin-category-option" key={category.id}><input type="checkbox" checked={form.categoryIds.includes(category.id)} onChange={event => patch('categoryIds', event.target.checked ? [...form.categoryIds, category.id] : form.categoryIds.filter(id => id !== category.id))} />{category.name}</label>)}</div><small>Choose every category where shoppers should find this product.</small></div>
    <label>Sizes<input value={attributeText('Size')} onChange={e => patchAttribute('Size', e.target.value)} placeholder="36, 38, 40" /><small>Enter sizes separated by commas.</small></label><label>Colors<input value={attributeText('Color')} onChange={e => patchAttribute('Color', e.target.value)} placeholder="Black, Blue" /><small>Enter colors separated by commas.</small></label>
    <div className="span-two admin-photo-manager"><label>Add product photos<input type="file" accept="image/*" multiple onChange={addPhotos} /><small>Select several images at once. Up to 30 photos, 20 MB each. Photos upload to Cloudinary when you save.</small></label>
      {photoError && <small role="alert" className="admin-error">{photoError}</small>}
      {form.images.length > 0 && <div className="admin-photo-list" aria-label="Product photo gallery">{form.images.map((image, index) => <div className="admin-photo-item" key={image.key || image.url || index}>
        <img src={image.preview || image.thumbnailUrl || image.url} alt={`Product photo ${index + 1}`} />
        <span>Photo {index + 1}{image.file ? ` · ${image.file.name}` : ''}</span>
        <div><button type="button" title="Move photo up" aria-label={`Move photo ${index + 1} up`} disabled={index === 0} onClick={() => movePhoto(index, -1)}><ArrowUp size={15} /></button><button type="button" title="Move photo down" aria-label={`Move photo ${index + 1} down`} disabled={index === form.images.length - 1} onClick={() => movePhoto(index, 1)}><ArrowDown size={15} /></button><button type="button" title="Remove photo" aria-label={`Remove photo ${index + 1}`} onClick={() => removePhoto(index)}><Trash2 size={15} /></button></div>
      </div>)}</div>}
      {!form.images.length && <small>No product photos yet. Add one or more above.</small>}
    </div>
    <label className="span-two">Short description<input value={form.shortDescription} onChange={e => patch('shortDescription', e.target.value)} /></label><label className="span-two">Product description<textarea rows="4" value={form.description} onChange={e => patch('description', e.target.value)} /></label>
    <label>SEO page title<input maxLength={250} value={form.metaTitle} onChange={e => patch('metaTitle', e.target.value)} /></label><label>SEO description<textarea rows="2" maxLength={500} value={form.metaDescription} onChange={e => patch('metaDescription', e.target.value)} /></label>
    <label className="admin-check"><input type="checkbox" checked={form.featured} onChange={e => patch('featured', e.target.checked)} /> Feature this product</label><label className="admin-check"><input type="checkbox" checked={form.manageStock} onChange={e => patch('manageStock', e.target.checked)} /> Track stock quantity</label>
  </div><div className="admin-editor-actions"><button type="button" className="admin-secondary" onClick={close}>Cancel</button><button className="admin-primary" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button></div></form>;
}
