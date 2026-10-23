import { Link } from 'react-router-dom';

export default function AuthShell({ image, imageAlt, eyebrow, title, children }) {
  return <main className="auth-page"><section className="auth-card"><div className="auth-panel"><Link to="/" className="auth-brand">LYN MARIE <span>BOUTIQUE</span></Link><p className="auth-eyebrow">{eyebrow}</p><h1>{title}</h1>{children}<Link to="/shop" className="auth-back">← Back to the boutique</Link></div><div className="auth-image-wrap"><img src={image} alt={imageAlt} /><div className="auth-image-shade" /><div className="auth-image-copy"><span>LYN MARIE BOUTIQUE · NAIROBI</span><p>Dress beautifully.<br /><em>Feel entirely yourself.</em></p></div></div></section></main>;
}
