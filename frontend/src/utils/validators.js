// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (minimum 6 characters)
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Phone number validation (Kenyan format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+254|0)[1-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Required field validation
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

// Post code validation
export const isValidPostCode = (postcode) => {
  // Kenyan post codes are 5 digits
  const postcodeRegex = /^\d{5}$/;
  return postcodeRegex.test(postcode);
};

// Validate form fields
export const validateField = (name, value) => {
  switch (name) {
    case 'email':
      return isValidEmail(value) ? '' : 'Please enter a valid email address';
    case 'password':
      return isValidPassword(value) ? '' : 'Password must be at least 6 characters';
    case 'phone':
      return isValidPhone(value) ? '' : 'Please enter a valid Kenyan phone number';
    case 'postcode':
      return isValidPostCode(value) ? '' : 'Please enter a valid post code (5 digits)';
    default:
      return isRequired(value) ? '' : 'This field is required';
  }
};

// Validate entire form
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach((field) => {
    const error = validateField(field, formData[field]);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};