import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';

const ForgotPassword = () => {
  const { forgotPassword, resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    const result = await forgotPassword(email);
    if (result.success) {
      setSuccess(true);
      setResetToken(result.resetToken || '');
      setEmail('');
    } else {
      setError(result.error);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const result = await resetPassword(resetToken, newPassword);
    if (result.success) {
      setResetToken('');
      setNewPassword('');
      setSuccess(false);
      setError('Password reset. You can now sign in.');
    } else setError(result.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">Reset your password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {error && <p className="mb-3 text-center text-red-600">{error}</p>}
            <p className="text-center">
              If an account exists, password reset instructions will be sent.
            </p>
            {resetToken && (
              <form className="mt-5 space-y-3" onSubmit={handleReset}>
                <p className="text-sm">Development reset: choose a new password below.</p>
                <Input label="New password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
                <Button type="submit" loading={loading} className="w-full">Set New Password</Button>
              </form>
            )}
            <div className="mt-4 text-center">
              <Link to="/auth/login" className="text-[#4c00b0] hover:text-[#4c00b0] font-medium">
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

            <Input
              name="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={handleChange}
              error={emailError}
              required
              autoComplete="email"
            />

            <Button type="submit" size="large" className="w-full" loading={loading}>
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="text-center space-y-2">
          <Link to="/auth/login" className="text-sm text-[#4c00b0] hover:text-[#4c00b0]">
            ← Back to login
          </Link>
          <br />
          <Link to="/shop" className="text-sm text-gray-600 hover:text-gray-900">
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
