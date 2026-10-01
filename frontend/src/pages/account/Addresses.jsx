import { useEffect, useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { authService } from '../../services/auth';

const Addresses = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'KE',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    authService.getAddresses().then(addresses => {
      if (active && addresses.shipping) setFormData(current => ({ ...current, ...addresses.shipping }));
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

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
    if (!formData.address_1.trim()) newErrors.address_1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postcode.trim()) newErrors.postcode = 'Post code is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      await authService.saveAddress('shipping', formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save address');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Address Book</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
          Address saved successfully!
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
            onChange={handleChange}
            error={errors.first_name}
            required
          />

          <Input
            name="last_name"
            label="Last Name"
            type="text"
            value={formData.last_name}
            onChange={handleChange}
            error={errors.last_name}
            required
          />
        </div>

        <Input
          name="company"
          label="Company (Optional)"
          type="text"
          value={formData.company}
          onChange={handleChange}
        />

        <Input
          name="address_1"
          label="Street Address"
          type="text"
          value={formData.address_1}
          onChange={handleChange}
          error={errors.address_1}
          required
        />

        <Input
          name="address_2"
          label="Apartment, suite, etc. (Optional)"
          type="text"
          value={formData.address_2}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            name="city"
            label="City"
            type="text"
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
            required
          />

          <Input
            name="state"
            label="State/Province"
            type="text"
            value={formData.state}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            name="postcode"
            label="Postal Code"
            type="text"
            value={formData.postcode}
            onChange={handleChange}
            error={errors.postcode}
            required
          />

          <Input
            name="country"
            label="Country"
            type="text"
            value={formData.country}
            onChange={handleChange}
            disabled
          />
        </div>

        <Input
          name="phone"
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
        />

        <div className="flex justify-end">
          <Button type="submit" loading={loading}>Save Address</Button>
        </div>
      </form>
    </div>
  );
};

export default Addresses;
