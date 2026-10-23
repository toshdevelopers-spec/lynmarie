import { useState, useEffect, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';

const Profile = () => {
  const { user, updateProfile, changePassword, loading } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordNotice, setPasswordNotice] = useState(null);
  const [showPasswords, setShowPasswords] = useState(false);

  // Initialize form data from user data
  const initialFormData = useMemo(() => ({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  }), [user]);

  useEffect(() => {
    const timer = setTimeout(() => setFormData(initialFormData), 0);
    return () => clearTimeout(timer);
  }, [initialFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const result = await updateProfile({ phone: formData.phone });
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error);
    }
  };

  const handlePasswordSubmit = async event => {
    event.preventDefault(); setPasswordError(null); setPasswordNotice(null);
    if (passwordForm.new_password !== passwordForm.confirm_password) return setPasswordError('New passwords do not match.');
    const result = await changePassword({ current_password: passwordForm.current_password, new_password: passwordForm.new_password });
    if (result.success) { setPasswordNotice(result.message); setPasswordForm({ current_password: '', new_password: '', confirm_password: '' }); }
    else setPasswordError(result.error || 'Could not change your password.');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
          Profile updated successfully!
        </div>
      )}

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            name="first_name"
            label="First Name"
            type="text"
            value={formData.first_name}
            readOnly
            error={errors.first_name}
            required
          />

          <Input
            name="last_name"
            label="Last Name"
            type="text"
            value={formData.last_name}
            readOnly
            error={errors.last_name}
            required
          />
        </div>

        <Input
          name="email"
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          disabled
        />

        <Input
          name="phone"
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />

        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>

      <section className="mt-8 rounded-xl border border-purple-100 bg-purple-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Saved delivery address</h3>
        <p className="my-2 text-sm text-gray-600">Edit your saved address and phone number for future checkouts.</p>
        <Link className="inline-flex rounded-lg bg-purple-800 px-4 py-2 font-semibold text-white" to="/my-account/addresses">Edit saved address</Link>
      </section>

      <section className="profile-password-section">
        <h3 className="text-xl font-semibold text-gray-900">Change password</h3>
        <p className="mb-5 text-sm text-gray-600">We’ll email you a confirmation after your password changes.</p>
        {passwordNotice && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{passwordNotice}</p>}
        {passwordError && <ErrorMessage message={passwordError} onDismiss={() => setPasswordError(null)} />}
        <form className="space-y-4" onSubmit={handlePasswordSubmit}>
          {['current_password', 'new_password', 'confirm_password'].map((name, index) => <div className="auth-password-wrap" key={name}><Input name={name} label={['Current password', 'New password', 'Confirm new password'][index]} type={index > 0 && showPasswords ? 'text' : 'password'} value={passwordForm[name]} onChange={event => setPasswordForm(current => ({ ...current, [name]: event.target.value }))} required minLength={index ? 12 : undefined} maxLength={72} autoComplete={index ? 'new-password' : 'current-password'} />{index === 1 && <button type="button" className="auth-password-toggle" onClick={() => setShowPasswords(value => !value)} aria-label={showPasswords ? 'Hide new password' : 'Show new password'} aria-pressed={showPasswords}>{showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}<span>{showPasswords ? 'Hide' : 'Show'}</span></button>}</div>)}
          <div className="flex justify-end"><Button type="submit" loading={loading}>Update password</Button></div>
        </form>
      </section>
    </div>
  );
};

export default Profile;
