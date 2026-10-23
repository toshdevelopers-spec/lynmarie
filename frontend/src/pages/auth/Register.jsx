import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { isValidEmail, isValidPassword } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import AuthShell from '../../components/auth/AuthShell';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { mergeGuestCart } = useCart();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const change = event => { const { name, value } = event.target; setForm(current => ({ ...current, [name]: value })); setErrors(current => ({ ...current, [name]: '' })); };
  const submit = async event => {
    event.preventDefault(); setError(null);
    const next = {};
    if (!form.firstName.trim()) next.firstName = 'First name is required';
    if (!form.lastName.trim()) next.lastName = 'Last name is required';
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address';
    if (!isValidPassword(form.password)) next.password = 'Password must be 12 to 72 characters';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next); if (Object.keys(next).length) return;
    const result = await register(form.email, form.password, form.firstName, form.lastName);
    if (!result.success) return setError(result.error);
    try { if (result.user?.id) await mergeGuestCart(result.user.id); }
    catch (cartError) { console.warn('Account created successfully; guest cart merge was skipped:', cartError); }
    navigate('/my-account');
  };

  return <AuthShell image="/hero/nairobi-fashion.jpg" imageAlt="Model wearing contemporary fashion in Nairobi" eyebrow="A LITTLE MORE YOU" title="Create your account">
    <p className="auth-intro">Save your details and make every new look yours.</p>
    <form className="auth-form auth-form-register" onSubmit={submit}>
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      <div className="auth-name-fields"><Input name="firstName" label="First name" value={form.firstName} onChange={change} error={errors.firstName} required autoComplete="given-name" /><Input name="lastName" label="Last name" value={form.lastName} onChange={change} error={errors.lastName} required autoComplete="family-name" /></div>
      <Input name="email" label="Email address" type="email" value={form.email} onChange={change} error={errors.email} required autoComplete="email" />
      <div className="auth-password-wrap"><Input name="password" label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={change} error={errors.password} required minLength={12} maxLength={72} autoComplete="new-password" /><button type="button" className="auth-password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}<span>{showPassword ? 'Hide' : 'Show'}</span></button></div>
      <div className="auth-password-wrap"><Input name="confirmPassword" label="Confirm password" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={change} error={errors.confirmPassword} required autoComplete="new-password" /><button type="button" className="auth-password-toggle" onClick={() => setShowConfirm(value => !value)} aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'} aria-pressed={showConfirm}>{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}<span>{showConfirm ? 'Hide' : 'Show'}</span></button></div>
      <p className="auth-password-hint">Use 12–72 characters for a stronger password.</p>
      <Button type="submit" size="large" className="w-full" loading={loading}>Create account</Button>
    </form>
    <p className="auth-switch">Already have an account? <Link to="/auth/login">Sign in</Link></p>
  </AuthShell>;
}
