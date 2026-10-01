import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { isValidPassword } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { authService } from '../../services/auth';

const ChangePassword = () => {
  const { loading } = useAuth();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (!isValidPassword(formData.new_password) || formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }

    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSubmitting(true);
      await authService.changePassword({ current_password: formData.current_password, new_password: formData.new_password });
      setSuccess(true);
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change password');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
          Password changed successfully!
        </div>
      )}

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          name="current_password"
          label="Current Password"
          type="password"
          value={formData.current_password}
          onChange={handleChange}
          error={errors.current_password}
          required
          autoComplete="current-password"
        />

        <Input
          name="new_password"
          label="New Password"
          type="password"
          value={formData.new_password}
          onChange={handleChange}
          error={errors.new_password}
          required
          autoComplete="new-password"
        />

        <Input
          name="confirm_password"
          label="Confirm New Password"
          type="password"
          value={formData.confirm_password}
          onChange={handleChange}
          error={errors.confirm_password}
          required
          autoComplete="new-password"
        />

        <div className="flex justify-end">
          <Button type="submit" loading={loading || submitting}>
            Change Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
