/**
 * Snap Validate - Enhanced Lightweight validator library
 * @version 0.3.0
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
    this.asyncRules = [];
    this.isOptional = false;
  }

  required(message = 'This field is required') {
    this.rules.push(() => {
      // Skip validation if optional and empty
      if (this.isOptional && (this.value === null || this.value === undefined || this.value === '')) {
        return new ValidationResult(true);
      }

      if (this.value === null || this.value === undefined || this.value === '') {
        return new ValidationResult(false, [message]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  optional() {
    this.isOptional = true;
    return this;
  }

  min(length, message = `Minimum length is ${length}`) {
    this.rules.push(() => {
      // Skip validation if optional and empty
      if (this.isOptional && (this.value === null || this.value === undefined || this.value === '')) {
        return new ValidationResult(true);
      }

      // Only validate if value exists and a length property
      if (this.value != null && this.value !== '') {
        // Check if value has length property (string, array)
        if (typeof this.value === 'string' || Array.isArray(this.value)) {
          if (this.value.length < length) {
            return new ValidationResult(false, [message]);
          }
        } else if (typeof this.value === 'number') {
          // For numbers, compare the value itself
          if (this.value < length) {
            return new ValidationResult(false, [message]);
          }
        } else {
          return new ValidationResult(false, ['Value must be a string, array, or number']);
        }
      }
      return new ValidationResult(true);
    });
    return this;
  }

  max(length, message = `Maximum length is ${length}`) {
    this.rules.push(() => {
      // Skip validation if optional and empty
      if (this.isOptional && (this.value === null || this.value === undefined || this.value === '')) {
        return new ValidationResult(true);
      }

      // Only validate if value exists and has a length property
      if (this.value != null && this.value !== '') {
        // Check if value has length property (string, array)
        if (typeof this.value === 'string' || Array.isArray(this.value)) {
          if (this.value.length > length) {
            return new ValidationResult(false, [message]);
          }
        } else if (typeof this.value === 'number') {
          // For numbers, compare the value itself
          if (this.value > length) {
            return new ValidationResult(false, [message]);
          }
        } else {
          return new ValidationResult(false, ['Value must be a string, array or number']);
        }
      }
      return new ValidationResult(true);
    });
    return this;
  }

  pattern(regex, message = 'Invalid format') {
    this.rules.push(() => {
      // Skip validation if optional and empty
      if (this.isOptional && (this.value === null || this.value === undefined || this.value === '')) {
        return new ValidationResult(true);
      }

      // Only test pattern if value exists and is not empty
      if (this.value != null && this.value !== '') {
        // Ensure value is a string before testing regex
        const stringValue = String(this.value);
        if (!regex.test(stringValue)) {
          return new ValidationResult(false, [message]);
        }
      }
      return new ValidationResult(true);
    });
    return this;
  }

  when(condition, validator) {
    this.rules.push(() => {
      // Evaluate condition
      const shouldValidate = typeof condition === 'function' ? condition(this.value) : condition;

      if (shouldValidate) {
        // Apply the conditional validator
        if (typeof validator === 'function') {
          const conditionalValidator = validator(this.value);
          return conditionalValidator.validate();
        } else {
          // If validator is already a BaseValidator instance
          return validator.validate();
        }
      }

      return new ValidationResult(true);
    });
    return this;
  }

  custom(validatorFn, message = 'Custom validation failed') {
    this.rules.push(() => {
      // Skip validation if optional and empty
      if (this.isOptional && (this.value === null || this.value === undefined || this.value === '')) {
        return new ValidationResult(true);
      }

      try {
        const result = validatorFn(this.value);

        // Handle boolean result
        if (typeof result === 'boolean') {
          return result ? new ValidationResult(true) : new ValidationResult(false, [message]);
        }

        // Handle ValidationResult object
        if (result && typeof result === 'object' && 'isValid' in result) {
          return result;
        }

        // Handle string result (error message)
        if (typeof result === 'string') {
          return new ValidationResult(false, [result]);
        }

        // Default to true if no clear result
        return new ValidationResult(true);
      } catch (error) {
        return new ValidationResult(false, [`Custom validation error: ${error.message}`]);
      }
    });
    return this;
  }

  customAsync(validatorFn, message = 'Async validation failed') {
    this.asyncRules.push(async () => {
      // Skip validation if optional and empty
      if (this.isOptional && (this.value === null || this.value === undefined || this.value === '')) {
        return new ValidationResult(true);
      }

      try {
        const result = await validatorFn(this.value);

        // Handle boolean result
        if (typeof result === 'boolean') {
          return result ? new ValidationResult(true) : new ValidationResult(false, [message]);
        }

        // Handle ValidationResult object
        if (result && typeof result === 'object' && 'isValid' in result) {
          return result;
        }

        // Handle string result (error message)
        if (typeof result === 'string') {
          return new ValidationResult(false, [result]);
        }

        // Default to true if no clear result
        return new ValidationResult(true);
      } catch (error) {
        return new ValidationResult(false, [`Async validation error: ${error.message}`]);
      }
    });
    return this;
  }

  validate() {
    const result = new ValidationResult(true);

    for (const rule of this.rules) {
      try {
        const ruleResult = rule();
        if (!ruleResult.isValid) {
          result.isValid = false;
          result.errors.push(...ruleResult.errors);
        }
      } catch (error) {
        // Handle any unexpected errors during validation
        result.isValid = false;
        result.errors.push(`Validation error: ${error.message}`);
      }
    }

    return result;
  }

  async validateAsync() {
    // First run synchronous validations
    const syncResult = this.validate();

    if (!syncResult.isValid) {
      return syncResult;
    }

    // Then run asynchronous validations
    const result = new ValidationResult(true, [...syncResult.errors]);

    for (const asyncRule of this.asyncRules) {
      try {
        const ruleResult = await asyncRule();
        if (!ruleResult.isValid) {
          result.isValid = false;
          result.errors.push(...ruleResult.errors);
        }
      } catch (error) {
        // Handle any unexpected errors during async validation
        result.isValid = false;
        result.errors.push(`Async validation error: ${error.message}`);
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

      // Remove spaces and ensure we have a string
      const cleanNum = String(num).replace(/\s/g, '');

      for (let i = cleanNum.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNum[i]);

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
      .required('Credit card number is required');

    // Add custom validation for credit card format and Luhn check
    validator.rules.push(() => {
      // Skip validation if optional and empty
      if (validator.isOptional && (validator.value === null || validator.value === undefined || validator.value === '')) {
        return new ValidationResult(true);
      }

      if (validator.value) {
        const cleanValue = String(validator.value).replace(/\s/g, '');

        // Check length (13-19 digits)
        if (!/^\d{13,19}$/.test(cleanValue)) {
          return new ValidationResult(false, ['Credit card must be 13-19 digits']);
        }

        // Check Luhn algorithm
        if (!luhnCheck(cleanValue)) {
          return new ValidationResult(false, ['Invalid credit card number']);
        }
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
      .pattern(/^[a-zA-Z0-9]+$/, 'Only letters and numbers are allowed');
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
  // Input validation
  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema must be a valid object');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Data must be a valid object');
  }

  const results = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(schema)) {
    try {
      const fieldValue = data[field];
      const result = typeof validator === 'function'
        ? validator(fieldValue).validate()
        : validator.validate();

      results[field] = result;
      if (!result.isValid) {
        isValid = false;
      }
    } catch (error) {
      // Handle validation setup errors
      results[field] = new ValidationResult(false, [`Validation setup error: ${error.message}`]);
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

// Async validation function
const validateAsync = async (schema, data) => {
  // Input validation
  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema must be a valid object');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Data must be a valid object');
  }

  const results = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(schema)) {
    try {
      const fieldValue = data[field];

      let result;
      if (typeof validator === 'function') {
        const validatorInstance = validator(fieldValue);
        result = validatorInstance.asyncRules.length > 0
          ? await validatorInstance.validateAsync()
          : validatorInstance.validate();
      } else {
        result = validator.asyncRules && validator.asyncRules.length > 0
          ? await validator.validateAsync()
          : validator.validate();
      }

      results[field] = result;
      if (!result.isValid) {
        isValid = false;
      }
    } catch (error) {
      // Handle validation setup errors
      results[field] = new ValidationResult(false, [`Validation setup error: ${error.message}`]);
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
  validate,
  validateAsync
};