/** Form validators */

export const validateEmail = (email) => {
  const re = /^\S+@\S+\.\S+$/;
  if (!email) return 'Email is required';
  if (!re.test(email)) return 'Please enter a valid email';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/\d/.test(password)) return 'Password must contain a number';
  return '';
};

export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 50) return 'Name cannot exceed 50 characters';
  return '';
};

export const validatePhone = (phone) => {
  if (!phone) return '';
  const re = /^[6-9]\d{9}$/;
  if (!re.test(phone)) return 'Please enter a valid 10-digit Indian phone number';
  return '';
};

export const validatePincode = (pincode) => {
  if (!pincode) return 'Pincode is required';
  const re = /^\d{6}$/;
  if (!re.test(pincode)) return 'Please enter a valid 6-digit pincode';
  return '';
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return '';
};
