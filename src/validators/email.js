const { BaseValidator } = require('../core/BaseValidator');

const email = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return new BaseValidator(value)
    .transform((v) => (typeof v === 'string' ? v.trim().toLowerCase() : v))
    .required('Email is required')
    .pattern(emailRegex, 'Invalid email format');
};

module.exports = { email };
