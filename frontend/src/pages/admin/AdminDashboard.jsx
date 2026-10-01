import { useCallback, useEffect, useState } from 'react';
import { LayoutDashboard, Shirt, Tags, Users, ShoppingBag, Star, MessageSquareText, Plus, Pencil, Archive, Check, LogOut, Menu, X, Search, RefreshCw, Trash2, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/admin';
import Loader from '../../components/ui/Loader';

const navItems = [
  ['overview', 'Overview', LayoutDashboard], ['products', 'Products & stock', Shirt], ['categories', 'Categories', Tags], ['cart', 'Cart activity', ShoppingBag],
  ['customers', 'Customers & staff', Users], ['orders', 'Orders', ShoppingBag], ['reviews', 'Reviews', Star], ['inquiries', 'Enquiries', MessageSquareText],
];
const emptyProduct = { name: '', description: '', shortDescription: '', sku: '', price: '', regularPrice: '', salePrice: '', stockQuantity: '1', categoryIds: [], imageUrls: [], metaTitle: '', metaDescription: '', featured: false, manageStock: true, status: 'PUBLISHED' };
const money = value => `KES ${Number(value || 0).toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;
const stamp = value => value ? new Date(value).toLocaleDateString() : '—';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState('overview');
  const [data, setData] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [editing, setEditing] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [userForm, setUserForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'CUSTOMER' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const addNotification = useCallback(message => {
    setNotifications(items => [{ id: `${Date.now()}-${Math.random()}`, message, time: new Date() }, ...items].slice(0, 8));
    setUnreadNotifications(count => count + 1);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (section === 'overview') setData(await adminService.dashboard());
      else if (section === 'products') { const [rows, categoryRows] = await Promise.all([adminService.products(), adminService.categories()]); setData({ rows }); setCategories(categoryRows); }
      else if (section === 'cart') setData({ rows: await adminService.cartActivity() });
      else if (section === 'categories') setCategories(await adminService.categories());
      else if (section === 'customers') setData({ rows: await adminService.customers() });
      else if (section === 'orders') setData({ rows: await adminService.orders() });
      else if (section === 'reviews') setData({ rows: await adminService.reviews() });
      else if (section === 'inquiries') setData({ rows: await adminService.inquiries() });
    } catch (err) { setError(err.response?.data?.message || 'Unable to load this section.'); }
    finally { setLoading(false); }
  }, [section]);
  useEffect(() => { const timer = window.setTimeout(() => refresh(), 0); return () => window.clearTimeout(timer); }, [refresh]);
  const run = async action => { setBusy(true); setNotice(''); setError(''); try { await action(); setNotice('Changes saved.'); addNotification('Your dashboard changes were saved.'); await refresh(); } catch (err) { setError(err.response?.data?.message || 'Unable to save changes.'); } finally { setBusy(false); } };

  useEffect(() => {
    let active = true;
    let previous = null;
    const checkForUpdates = async () => {
      try {
        const snapshot = await adminService.dashboard();
        if (!active) return;
        const counts = snapshot.counts || {};
        if (previous && counts.inquiries > previous.inquiries) addNotification('A new customer enquiry has arrived.');
        if (previous && counts.orders > previous.orders) addNotification('A new customer order has arrived.');
        previous = { inquiries: counts.inquiries || 0, orders: counts.orders || 0 };
      } catch { /* The active section shows connection errors when data is opened. */ }
    };
    checkForUpdates();
    const timer = window.setInterval(checkForUpdates, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, [addNotification]);
  const setSectionAndClose = key => { setSection(key); setMobileNav(false); setEditing(null); setSearch(''); };

  const openProduct = product => {
    setEditing(product?.id || 'new');
    if (!product) { setProductForm(emptyProduct); return; }
    setProductForm({ name: product.name, description: product.description || '', shortDescription: product.shortDescription || '', sku: product.sku || '', price: String(product.price), regularPrice: String(product.regularPrice ?? product.price), salePrice: product.salePrice == null ? '' : String(product.salePrice), stockQuantity: String(product.stockQuantity ?? 0), categoryIds: product.categories?.map(x => x.categoryId || x.category?.id || x.id) || [], imageUrls: product.images?.map(i => i.url) || [], metaTitle: product.metaTitle || '', metaDescription: product.metaDescription || '', featured: product.featured, manageStock: product.manageStock, status: product.status });
  };
  const saveProduct = async e => {
    e.preventDefault(); const body = { ...productForm, price: Number(productForm.salePrice || productForm.regularPrice || productForm.price), regularPrice: productForm.regularPrice ? Number(productForm.regularPrice) : null, salePrice: productForm.salePrice ? Number(productForm.salePrice) : null, stockQuantity: Number(productForm.stockQuantity), categoryIds: productForm.categoryIds.map(Number), imageUrls: productForm.imageUrls.map(x => x.trim()).filter(Boolean) };
    await run(async () => { if (editing === 'new') await adminService.createProduct(body); else await adminService.updateProduct(editing, body); setEditing(null); });
  };
  const saveUser = async e => { e.preventDefault(); await run(async () => { await adminService.createUser(userForm); setUserForm({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'CUSTOMER' }); }); };
  const filtered = rows => (rows || []).filter(row => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));

  return <div className="admin-shell">
    <aside className={`admin-sidebar ${mobileNav ? 'is-open' : ''}`}>
      <div className="admin-brand"><span className="admin-brand-mark">LM</span><span><b>LynMarie</b><small>STORE ADMIN</small></span><button className="admin-mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={19} /></button></div>
      <div className="admin-nav-label">MANAGE STORE</div>
      <nav className="admin-nav">{navItems.map(([key, label, Icon]) => <button key={key} className={section === key ? 'active' : ''} onClick={() => setSectionAndClose(key)}><Icon size={18} /><span>{label}</span>{key === 'inquiries' && data.counts?.inquiries > 0 && <i>{data.counts.inquiries}</i>}</button>)}</nav>
      <div className="admin-sidebar-bottom"><div className="admin-person"><span>{(user?.first_name || user?.email || 'A').slice(0, 1).toUpperCase()}</span><div><b>{user?.first_name || 'Administrator'}</b><small>{user?.email}</small></div></div><button onClick={logout}><LogOut size={17} /> Sign out</button></div>
    </aside>
    {mobileNav && <button className="admin-scrim" aria-label="Close admin navigation" onClick={() => setMobileNav(false)} />}
    <main className="admin-main">
      <header className="admin-topbar"><button className="admin-menu-toggle" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu /></button><div><span>Store management</span><h1>{navItems.find(([key]) => key === section)?.[1]}</h1></div><div className="admin-top-actions"><span className="admin-live"><i /> Store is live</span><div className="admin-notification-wrap"><button onClick={() => { setNotificationsOpen(open => !open); setUnreadNotifications(0); }} aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ''}`} aria-expanded={notificationsOpen}><Bell size={17} />{unreadNotifications > 0 && <i className="admin-notification-count">{unreadNotifications}</i>}</button>{notificationsOpen && <section className="admin-notification-panel"><div className="admin-notification-heading"><b>Updates</b><span>Live</span></div>{notifications.length ? notifications.map(item => <article key={item.id}><p>{item.message}</p><small>{item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></article>) : <p className="admin-notification-empty">New enquiries, orders, and saved changes will appear here.</p>}</section>}</div><button onClick={refresh} aria-label="Refresh data"><RefreshCw size={17} /></button></div></header>
      <section className="admin-content">
        {notice && <div className="admin-notice">{notice}</div>}{error && <div className="admin-error">{error}</div>}
        {loading ? <div className="admin-loading"><Loader size="large" /></div> : <>
          {section === 'overview' && <Overview data={data} onGo={setSectionAndClose} />}
          {section === 'products' && <>
            <div className="admin-toolbar"><div><h2>Product catalogue</h2><p>Manage product details, visibility, pricing and live inventory.</p></div><button className="admin-primary" onClick={() => openProduct(null)}><Plus size={17} /> Add product</button></div>
            {editing && <ProductEditor form={productForm} setForm={setProductForm} categories={categories} isEditing={editing !== 'new'} close={() => setEditing(null)} save={saveProduct} busy={busy} />}
            <SearchBox value={search} setValue={setSearch} />
            <div className="admin-table-wrap"><table><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>SEO</th><th /></tr></thead><tbody>{filtered(data.rows).map(p => <tr key={p.id}><td><div className="admin-product-cell"><img src={p.images?.[0]?.url || '/logo.webp'} alt="" /><div><b>{p.name}</b><small>{p.sku || 'No SKU'} · {p.categories?.map(c => c.category?.name || c.name).join(', ') || 'Uncategorised'}</small></div></div></td><td>{p.salePrice ? <><b>{money(p.salePrice)}</b><del>{money(p.regularPrice)}</del></> : money(p.price)}</td><td>{p.manageStock ? `${p.stockQuantity ?? 0} units` : 'Not tracked'}</td><td><span className={`admin-badge ${p.status === 'PUBLISHED' ? 'good' : 'muted'}`}>{p.status}</span></td><td>{p.metaTitle || p.metaDescription ? 'Set' : 'Missing'}</td><td className="admin-row-actions"><button aria-label="Edit product" onClick={() => openProduct(p)}><Pencil size={16} /></button><button aria-label="Remove product" onClick={() => run(() => adminService.deleteProduct(p.id))}><Archive size={16} /></button></td></tr>)}</tbody></table>{!data.rows?.length && <Empty message="No products found." />}</div>
          </>}
          {section === 'cart' && <><SectionHeader title="Cart activity" caption="Recent items shoppers added to their baskets. Signed-in shoppers are linked to their customer profile." /><div className="admin-table-wrap"><table><thead><tr><th>Item</th><th>Customer</th><th>Email</th><th>Quantity</th><th>Added</th></tr></thead><tbody>{data.rows?.map(event => { const name = [event.user?.firstName, event.user?.lastName].filter(Boolean).join(' '); return <tr key={event.id}><td><div className="admin-product-cell"><img src={event.product?.images?.[0]?.url || '/logo.webp'} alt="" /><div><b>{event.product?.name || 'Product no longer listed'}</b><small>{event.product?.sku || 'SKU unavailable'}</small></div></div></td><td>{name || (event.user ? 'Customer' : `Guest · ${event.visitorId.slice(-6)}`)}</td><td>{event.user?.email || 'Not provided'}</td><td>{event.metadata?.quantity || 1}</td><td>{stamp(event.createdAt)}</td></tr>; })}</tbody></table>{!data.rows?.length && <Empty message="Cart additions will show here as visitors shop." />}</div></>}
          {section === 'categories' && <><div className="admin-toolbar"><div><h2>Shop categories</h2><p>Organise products so shoppers can browse the right collections.</p></div></div><form className="admin-inline-form" onSubmit={e => { e.preventDefault(); run(async () => { if (editingCategory) await adminService.updateCategory(editingCategory, categoryForm); else await adminService.createCategory(categoryForm); setCategoryForm({ name: '', description: '' }); setEditingCategory(null); }); }}><input placeholder="Category name" required value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} /><input placeholder="Short description" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} /><button className="admin-primary">{editingCategory ? <Pencil size={16} /> : <Plus size={16} />}{editingCategory ? ' Save category' : ' Add category'}</button></form><div className="admin-category-grid">{categories.map(c => <article key={c.id}><span><Tags size={19} /></span><div className="admin-category-info"><b>{c.name}</b><small>/{c.slug} · {c._count?.products || 0} products</small></div><button className="admin-category-action" title="Edit category" onClick={() => { setEditingCategory(c.id); setCategoryForm({ name: c.name, description: c.description || '' }); }}><Pencil size={14} /></button>{!c._count?.products && <button className="admin-category-action" title="Delete empty category" onClick={() => run(() => adminService.deleteCategory(c.id))}><Trash2 size={14} /></button>}</article>)}</div></>}
          {section === 'customers' && <><div className="admin-toolbar"><div><h2>Customers & staff</h2><p>Review customer accounts, control access and add team members.</p></div></div><form className="admin-user-form" onSubmit={saveUser}><input placeholder="First name" value={userForm.firstName} onChange={e => setUserForm({ ...userForm, firstName: e.target.value })} /><input placeholder="Last name" value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} /><input type="email" placeholder="Email address" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} /><input type="tel" placeholder="Phone (optional)" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} /><input type="password" minLength={8} placeholder="Temporary password (8+ chars)" required value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} /><select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}><option value="CUSTOMER">Customer</option>{user?.email?.toLowerCase() === 'adelewigitz@gmail.com' && <option value="ADMIN">Administrator</option>}</select><button className="admin-primary"><Plus size={16} /> Add user</button></form><SearchBox value={search} setValue={setSearch} /><div className="admin-table-wrap"><table><thead><tr><th>Customer / staff</th><th>Contact</th><th>Orders</th><th>Joined</th><th>Role</th><th>Access</th><th /></tr></thead><tbody>{filtered(data.rows).map(c => <tr key={c.id}><td><b>{[c.firstName, c.lastName].filter(Boolean).join(' ') || 'Customer'}</b><small>{c.role}</small></td><td>{c.email}<small>{c.phone || 'No phone added'}</small></td><td>{c._count?.orders || 0}</td><td>{stamp(c.createdAt)}</td><td>{user?.email?.toLowerCase() === 'adelewigitz@gmail.com' && c.email?.toLowerCase() !== 'adelewigitz@gmail.com' ? <select aria-label={`Role for ${c.email}`} value={c.role} onChange={e => run(() => adminService.updateUser(c.id, { role: e.target.value }))}><option value="CUSTOMER">Customer</option><option value="ADMIN">Administrator</option></select> : <span className="admin-badge muted">{c.role}</span>}</td><td><span className={`admin-badge ${c.isActive ? 'good' : 'muted'}`}>{c.isActive ? 'Active' : 'Disabled'}</span></td><td className="admin-row-actions">{c.email !== 'adelewigitz@gmail.com' && <button title={c.isActive ? 'Disable account' : 'Enable account'} onClick={() => run(() => adminService.updateUser(c.id, { isActive: !c.isActive }))}>{c.isActive ? <Archive size={16} /> : <Check size={16} />}</button>}</td></tr>)}</tbody></table></div></>}
          {section === 'orders' && <><SectionHeader title="Orders" caption="Track fulfilment and update customer order status." /><SearchBox value={search} setValue={setSearch} /><div className="admin-table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead><tbody>{filtered(data.rows).map(o => <tr key={o.id}><td><b>{o.orderNumber || `#${o.id}`}</b><small>{o.paymentMethod || 'Payment pending'}</small></td><td>{o.billingFirstName} {o.billingLastName}<small>{o.user ? `Account: ${o.user.email}` : `Guest checkout · ${o.billingEmail}`}</small></td><td>{o.items?.map(i => `${i.productName} ×${i.quantity}`).join(', ')}</td><td>{money(o.total)}</td><td>{stamp(o.createdAt)}</td><td><select value={o.status} onChange={e => run(() => adminService.setOrderStatus(o.id, e.target.value))}>{['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED'].map(s => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table>{!data.rows?.length && <Empty message="Orders will appear here after checkout." />}</div></>}
          {section === 'reviews' && <><SectionHeader title="Customer reviews" caption="Approve reviews before they appear publicly on the shop." /><div className="admin-review-grid">{filtered(data.rows).map(r => <article key={r.id}><div className="admin-review-top"><b>{r.reviewer}</b><span>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span></div><small>{r.product?.name || 'Product'} · {stamp(r.createdAt)}</small><p>{r.review}</p><button className={r.approved ? 'admin-secondary' : 'admin-primary'} onClick={() => run(() => adminService.approveReview(r.id, !r.approved))}>{r.approved ? 'Unpublish review' : <><Check size={16} /> Approve review</>}</button></article>)}</div>{!data.rows?.length && <Empty message="No reviews have been submitted." />}</>}
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
function Empty({ message }) { return <div className="admin-empty">{message}</div>; }
function ProductEditor({ form, setForm, categories, isEditing, close, save, busy }) {
  const patch = (key, value) => setForm(current => ({ ...current, [key]: value }));
  return <form className="admin-editor" onSubmit={save}><div className="admin-editor-heading"><div><h3>{isEditing ? 'Edit product' : 'Add a product'}</h3><p>Changes publish to the storefront immediately when status is Published.</p></div><button type="button" className="admin-close" onClick={close}>×</button></div><div className="admin-form-grid">
    <label>Product name<input required value={form.name} onChange={e => patch('name', e.target.value)} /></label><label>SKU<input value={form.sku} onChange={e => patch('sku', e.target.value)} /></label>
    <label>Regular price (KES)<input required type="number" min="0" step="0.01" value={form.regularPrice} onChange={e => patch('regularPrice', e.target.value)} /></label><label>Sale price (optional)<input type="number" min="0" step="0.01" value={form.salePrice} onChange={e => patch('salePrice', e.target.value)} /></label>
    <label>Stock quantity<input type="number" min="0" value={form.stockQuantity} onChange={e => patch('stockQuantity', e.target.value)} /></label><label>Visibility<select value={form.status} onChange={e => patch('status', e.target.value)}><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="PRIVATE">Hidden</option></select></label>
    <label className="span-two">Categories<select multiple value={form.categoryIds.map(String)} onChange={e => patch('categoryIds', [...e.target.selectedOptions].map(o => Number(o.value)))}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><small>Use Ctrl/Command to select more than one.</small></label>
    <label className="span-two">Image URLs, one per line<textarea rows="3" value={form.imageUrls.join('\n')} onChange={e => patch('imageUrls', e.target.value.split('\n'))} placeholder="https://…" /></label>
    <label className="span-two">Short description<input value={form.shortDescription} onChange={e => patch('shortDescription', e.target.value)} /></label><label className="span-two">Product description<textarea rows="4" value={form.description} onChange={e => patch('description', e.target.value)} /></label>
    <label>SEO page title<input maxLength={250} value={form.metaTitle} onChange={e => patch('metaTitle', e.target.value)} /></label><label>SEO description<textarea rows="2" maxLength={500} value={form.metaDescription} onChange={e => patch('metaDescription', e.target.value)} /></label>
    <label className="admin-check"><input type="checkbox" checked={form.featured} onChange={e => patch('featured', e.target.checked)} /> Feature this product</label><label className="admin-check"><input type="checkbox" checked={form.manageStock} onChange={e => patch('manageStock', e.target.checked)} /> Track stock quantity</label>
  </div><div className="admin-editor-actions"><button type="button" className="admin-secondary" onClick={close}>Cancel</button><button className="admin-primary" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button></div></form>;
}
