/**
 * Snap Validate - Lightweight validator library
 * @version 0.0.1
 */

// Core validation class
class ValidationResult {
  constructor(isValid, errors = []) {
    this.isValid = isValid;
    this.errors = errors;
  }

  addError(message) {
    this.errors.push(message);
    this.isValid = false;
    return this;
  }
}

// Base validator class
class BaseValidator {
  constructor(value) {
    this.value = value;
    this.rules = [];
  }

  required(message = 'This field is required') {
    this.rules.push(() => {
      if (this.value === null || this.value === undefined || this.value === '') {
        return new ValidationResult(false, [message]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  min(length, message = `Minimum length is ${length}`) {
    this.rules.push(() => {
      if (this.value && this.value.length < length) {
        return new ValidationResult(false, [message]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  max(length, message = `Maximum length is ${length}`) {
    this.rules.push(() => {
      if (this.value && this.value.length > length) {
        return new ValidationResult(false, [message]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  pattern(regex, message = 'Invalid format') {
    this.rules.push(() => {
      if (this.value && !regex.test(this.value)) {
        return new ValidationResult(false, [message]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  validate() {
    const result = new ValidationResult(true);

    for (const rule of this.rules) {
      const ruleResult = rule();
      if (!ruleResult.isValid) {
        result.isValid = false;
        result.errors.push(...ruleResult.errors);
      }
    }

    return result;
  }
}

// Predefined validators
const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return new BaseValidator(value)
      .required('Email is required')
      .pattern(emailRegex, 'Invalid email format');
  },

  phone: (value, format = 'us') => {
    const phoneRegex = {
      us: /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
      international: /^\+[1-9]\d{1,14}$/,
      simple: /^\d{10,15}$/
    };

    return new BaseValidator(value)
      .required('Phone number is required')
      .pattern(phoneRegex[format] || phoneRegex.simple, 'Invalid phone number format');
  },

  creditCard: (value) => {
    // Luhn algorithm check
    const luhnCheck = (num) => {
      let sum = 0;
      let isEven = false;

      for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i]);

        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }

        sum += digit;
        isEven = !isEven;
      }

      return sum % 10 === 0;
    };

    const validator = new BaseValidator(value)
      .required('Credit card number is required')
      .pattern(/^\d{13,19}$/, 'Credit card must be 13-19 digits');

    validator.rules.push(() => {
      if (value && !luhnCheck(value.replace(/\s/g, ''))) {
        return new ValidationResult(false, ['Invalid credit card number']);
      }
      return new ValidationResult(true);
    });

    return validator;
  },

  url: (value) => {
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return new BaseValidator(value)
      .required('URL is required')
      .pattern(urlRegex, 'Invalid URL format');
  },

  password: (value, options = {}) => {
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
      validator.pattern(/[A-Z]/, 'Password must contain at least one uppercase letter');
    }
    if (requireLowercase) {
      validator.pattern(/[a-z]/, 'Password must contain at least one lowercase letter');
    }
    if (requireNumbers) {
      validator.pattern(/\d/, 'Password must contain at least one number');
    }
    if (requireSpecialChars) {
      validator.pattern(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');
    }

    return validator;
  },

  alphanumeric: (value) => {
    return new BaseValidator(value)
      .required('This field is required')
      .pattern(/^[a-zA-Z0-9]+$/, 'Only letters and number are allowed');
  },

  numeric: (value) => {
    return new BaseValidator(value)
      .required('This field is required')
      .pattern(/^\d+$/, 'Only numbers are allowed');
  },

  zipCode: (value, country = 'us') => {
    const zipRegex = {
      us: /^\d{5}(-\d{4})?$/,
      ca: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
      uk: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i
    };

    return new BaseValidator(value)
      .required('Zip code is required')
      .pattern(zipRegex[country] || zipRegex.us, 'Invalid zip code format');
  }
};

// Main validation function
const validate = (schema, data) => {
  const results = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(schema)) {
    const fieldValue = data[field];
    const result = typeof validator === 'function'
      ? validator(fieldValue).validate()
      : validator.validate();

    results[field] = result;
    if (!result.isValid) {
      isValid = false;
    }
  }

  return {
    isValid,
    errors: results,
    getErrors: () => {
      const errors = {};
      for (const [field, result] of Object.entries(results)) {
        if (!result.isValid) {
          errors[field] = result.errors;
        }
      }
      return errors;
    }
  };
};

module.exports = {
  BaseValidator,
  ValidationResult,
  validators,
  validate
};