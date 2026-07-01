const { BaseValidator } = require('../core/BaseValidator');

const password = (value, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false
  } = options;

  const validator = new BaseValidator(value)
    .required('Password is required')
    .min(minLength, `Password must be at least ${minLength} characters`);

  if (requireUppercase) {
    validator.pattern(
      /[A-Z]/,
      'Password must contain at least one uppercase letter'
    );
  }
  if (requireLowercase) {
    validator.pattern(
      /[a-z]/,
      'Password must contain at least one lowercase letter'
    );
  }
  if (requireNumbers) {
    validator.pattern(/\d/, 'Password must contain at least one number');
  }
  if (requireSpecialChars) {
    validator.pattern(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must contain at least one special character'
    );
  }

  return validator;
};

module.exports = { password };
