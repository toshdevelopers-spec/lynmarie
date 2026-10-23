import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import AuthShell from '../../components/auth/AuthShell';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { mergeGuestCart } = useCart();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async event => {
    event.preventDefault(); setError(null);
    const result = await login(email, password);
    if (!result.success) return setError(result.error);
    try { if (result.user?.id) await mergeGuestCart(result.user.id); }
    catch (cartError) { console.warn('Signed in successfully; guest cart merge was skipped:', cartError); }
    navigate('/my-account');
  };

  return <AuthShell image="/hero/occasion.webp" imageAlt="Model in an elegant occasion dress" eyebrow="WELCOME BACK" title="Sign in to your account">
    <p className="auth-intro">Your favourite looks are waiting for you.</p>
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      <Input name="email" label="Email address" type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="username" />
      <div className="auth-password-wrap"><Input name="password" label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} required autoComplete="current-password" /><button type="button" className="auth-password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}<span>{showPassword ? 'Hide' : 'Show'}</span></button></div>
      <div className="auth-options"><label><input type="checkbox" /> Remember me</label><Link to="/auth/forgot-password">Forgot password?</Link></div>
      <Button type="submit" size="large" className="w-full" loading={loading}>Sign in</Button>
    </form>
    <p className="auth-switch">New to Lyn Marie? <Link to="/auth/register">Create an account</Link></p>
  </AuthShell>;
}
