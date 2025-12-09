/**
 * Snap Validate - Enhanced Lightweight validator library
 * @version 0.4.0 - Phase 1: Arrays, Nested Objects, Transforms
 */

// Utility function to safely test regex with timeout protection
const safeRegexTest = (regex, str, timeoutMs = 1000) => {
  return new Promise((resolve, reject) => {
    if (str.length > 10000) {
      reject(new Error('Input too long for regex validation'));
      return;
    }

    if (!isRegexSafe(regex)) {
      reject(new Error('Unsafe regex pattern detected'));
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error('Regex execution timeout - potential ReDoS attack'));
    }, timeoutMs);

    try {
      const result = regex.test(str);
      clearTimeout(timeout);
      resolve(result);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
};

// Synchronous safe regex test with input length protection
const safeRegexTestSync = (regex, str, maxLength = 10000) => {
  if (str.length > maxLength) {
    throw new Error('Input too long for pattern validation');
  }
  return regex.test(str);
};

// Function to detect potentially dangerous regex patterns
const isRegexSafe = (regex) => {
  const regexStr = regex.toString();

  const dangerousPatterns = [
    /\([^)]*[+*?][^)]*\)[+*?]/,
    /\([^)]*\|[^)]*\)[+*]/,
    /\([^)]*\.\*[^)]*\)\*/,
    /[+*?]{2,}/,
    /\([^)]*\|[^)]*\)\+.*\([^)]*\|[^)]*\)\+/
  ];

  const isDangerous = dangerousPatterns.some((pattern) =>
    pattern.test(regexStr)
  );

  return !isDangerous;
};

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
    this.regexTimeout = 1000;
    this.fieldName = null; // Track field name for better error messages
  }

  // Set field name for contextual error messages
  setFieldName(name) {
    this.fieldName = name;
    return this;
  }

  // Helper to format error messages with field context
  _formatError(message) {
    if (
      this.fieldName &&
      !message.toLowerCase().includes(this.fieldName.toLowerCase())
    ) {
      return `${this.fieldName}: ${message}`;
    }
    return message;
  }

  required(message = 'This field is required') {
    this.rules.push(() => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined || this.value === '')
      ) {
        return new ValidationResult(true);
      }

      if (
        this.value === null ||
        this.value === undefined ||
        this.value === ''
      ) {
        return new ValidationResult(false, [this._formatError(message)]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  optional() {
    this.isOptional = true;
    return this;
  }

  setRegexTimeout(timeoutMs) {
    this.regexTimeout = timeoutMs;
    return this;
  }

  // Transform/sanitize data before validation
  transform(fn, errorMessage = 'Transform function failed') {
    this.rules.push(() => {
      if (this.value != null && this.value !== '') {
        try {
          this.value = fn(this.value);
        } catch (error) {
          return new ValidationResult(false, [
            this._formatError(`${errorMessage}: ${error.message}`)
          ]);
        }
      }
      return new ValidationResult(true);
    });
    return this;
  }

  // Check if value equals another value
  equals(compareValue, message) {
    const defaultMessage = `Must equal ${compareValue}`;
    this.rules.push(() => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined || this.value === '')
      ) {
        return new ValidationResult(true);
      }

      if (this.value !== compareValue) {
        return new ValidationResult(false, [
          this._formatError(message || defaultMessage)
        ]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  // Check if value is one of allowed values
  oneOf(allowedValues, message) {
    const defaultMessage = `Must be one of: ${allowedValues.join(', ')}`;
    this.rules.push(() => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined || this.value === '')
      ) {
        return new ValidationResult(true);
      }

      if (!allowedValues.includes(this.value)) {
        return new ValidationResult(false, [
          this._formatError(message || defaultMessage)
        ]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  // Check if value is between min and max (for numbers)
  between(min, max, message) {
    const defaultMessage = `Must be between ${min} and ${max}`;
    this.rules.push(() => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined || this.value === '')
      ) {
        return new ValidationResult(true);
      }

      const numValue =
        typeof this.value === 'number' ? this.value : parseFloat(this.value);

      if (isNaN(numValue) || numValue < min || numValue > max) {
        return new ValidationResult(false, [
          this._formatError(message || defaultMessage)
        ]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  min(length, message = `Minimum length is ${length}`) {
    this.rules.push(() => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined || this.value === '')
      ) {
        return new ValidationResult(true);
      }

      if (this.value != null && this.value !== '') {
        if (typeof this.value === 'string' || Array.isArray(this.value)) {
          if (this.value.length < length) {
            return new ValidationResult(false, [this._formatError(message)]);
          }
        } else if (typeof this.value === 'number') {
          if (this.value < length) {
            return new ValidationResult(false, [this._formatError(message)]);
          }
        } else {
          return new ValidationResult(false, [
            this._formatError('Value must be a string, array, or number')
          ]);
        }
      }
      return new ValidationResult(true);
    });
    return this;
  }

  max(length, message = `Maximum length is ${length}`) {
    this.rules.push(() => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined || this.value === '')
      ) {
        return new ValidationResult(true);
      }

      if (this.value != null && this.value !== '') {
        if (typeof this.value === 'string' || Array.isArray(this.value)) {
          if (this.value.length > length) {
            return new ValidationResult(false, [this._formatError(message)]);
          }
        } else if (typeof this.value === 'number') {
          if (this.value > length) {
            return new ValidationResult(false, [this._formatError(message)]);
          }
        } else {
          return new ValidationResult(false, [
            this._formatError('Value must be a string, array or number')
          ]);
        }
      }
      return new ValidationResult(true);
    });
    return this;
  }

  // Validate that value is an array
  array(message = 'Must be an array') {
    this.rules.push(() => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined)
      ) {
        return new ValidationResult(true);
      }

      if (!Array.isArray(this.value)) {
        return new ValidationResult(false, [this._formatError(message)]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  // Validate each item in an array
  arrayOf(validator, message = 'Invalid array items') {
    this.rules.push(() => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined)
      ) {
        return new ValidationResult(true);
      }

      if (!Array.isArray(this.value)) {
        return new ValidationResult(false, [
          this._formatError('Value must be an array')
        ]);
      }

      const errors = [];
      this.value.forEach((item, index) => {
        try {
          const itemValidator =
            typeof validator === 'function' ? validator(item) : validator;
          const result = itemValidator.validate();

          if (!result.isValid) {
            errors.push(`[${index}]: ${result.errors.join(', ')}`);
          }
        } catch (error) {
          errors.push(`[${index}]: Validation error - ${error.message}`);
        }
      });

      if (errors.length > 0) {
        return new ValidationResult(false, [
          this._formatError(`${message}: ${errors.join('; ')}`)
        ]);
      }

      return new ValidationResult(true);
    });
    return this;
  }

  // Async array validation
  arrayOfAsync(validator, message = 'Invalid array items') {
    this.asyncRules.push(async () => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined)
      ) {
        return new ValidationResult(true);
      }

      if (!Array.isArray(this.value)) {
        return new ValidationResult(false, [
          this._formatError('Value must be an array')
        ]);
      }

      const errors = [];
      for (let index = 0; index < this.value.length; index++) {
        try {
          const item = this.value[index];
          const itemValidator =
            typeof validator === 'function' ? validator(item) : validator;

          const result =
            itemValidator.asyncRules && itemValidator.asyncRules.length > 0
              ? await itemValidator.validateAsync()
              : itemValidator.validate();

          if (!result.isValid) {
            errors.push(`[${index}]: ${result.errors.join(', ')}`);
          }
        } catch (error) {
          errors.push(`[${index}]: Validation error - ${error.message}`);
        }
      }

      if (errors.length > 0) {
        return new ValidationResult(false, [
          this._formatError(`${message}: ${errors.join('; ')}`)
        ]);
      }

      return new ValidationResult(true);
    });
    return this;
  }

  // Validate nested objects
  object(schema, message = 'Invalid object structure') {
    this.rules.push(() => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined)
      ) {
        return new ValidationResult(true);
      }

      if (
        typeof this.value !== 'object' ||
        this.value === null ||
        Array.isArray(this.value)
      ) {
        return new ValidationResult(false, [this._formatError(message)]);
      }

      try {
        const result = validate(schema, this.value);

        if (!result.isValid) {
          const fieldErrors = result.getErrors();
          const errorMessages = Object.entries(fieldErrors)
            .map(([field, errs]) => `${field}: ${errs.join(', ')}`)
            .join('; ');

          return new ValidationResult(false, [
            this._formatError(`Object validation failed - ${errorMessages}`)
          ]);
        }

        return new ValidationResult(true);
      } catch (error) {
        return new ValidationResult(false, [
          this._formatError(`Object validation error: ${error.message}`)
        ]);
      }
    });
    return this;
  }

  // Async nested object validation
  objectAsync(schema, message = 'Invalid object structure') {
    this.asyncRules.push(async () => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined)
      ) {
        return new ValidationResult(true);
      }

      if (
        typeof this.value !== 'object' ||
        this.value === null ||
        Array.isArray(this.value)
      ) {
        return new ValidationResult(false, [this._formatError(message)]);
      }

      try {
        const result = await validateAsync(schema, this.value);

        if (!result.isValid) {
          const fieldErrors = result.getErrors();
          const errorMessages = Object.entries(fieldErrors)
            .map(([field, errs]) => `${field}: ${errs.join(', ')}`)
            .join('; ');

          return new ValidationResult(false, [
            this._formatError(`Object validation failed - ${errorMessages}`)
          ]);
        }

        return new ValidationResult(true);
      } catch (error) {
        return new ValidationResult(false, [
          this._formatError(`Object validation error: ${error.message}`)
        ]);
      }
    });
    return this;
  }

  pattern(regex, message = 'Invalid format') {
    if (!isRegexSafe(regex)) {
      throw new Error(
        'Potentially unsafe regex pattern detected. Please use a simple pattern.'
      );
    }

    this.rules.push(() => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined || this.value === '')
      ) {
        return new ValidationResult(true);
      }

      if (this.value != null && this.value !== '') {
        const stringValue = String(this.value);

        try {
          if (!safeRegexTestSync(regex, stringValue)) {
            return new ValidationResult(false, [this._formatError(message)]);
          }
        } catch (error) {
          if (error.message.includes('Input too long')) {
            return new ValidationResult(false, [
              this._formatError('Input too long for pattern validation')
            ]);
          }
          return new ValidationResult(false, [
            this._formatError('Pattern validation failed')
          ]);
        }
      }
      return new ValidationResult(true);
    });
    return this;
  }

  patternAsync(regex, message = 'Invalid format') {
    if (!isRegexSafe(regex)) {
      throw new Error(
        'Potentially unsafe regex pattern detected. Please use a simple pattern.'
      );
    }

    this.asyncRules.push(async () => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined || this.value === '')
      ) {
        return new ValidationResult(true);
      }

      if (this.value != null && this.value !== '') {
        const stringValue = String(this.value);

        if (stringValue.length > 10000) {
          return new ValidationResult(false, [
            this._formatError('Input too long for pattern validation')
          ]);
        }

        try {
          const result = await safeRegexTest(
            regex,
            stringValue,
            this.regexTimeout
          );
          if (!result) {
            return new ValidationResult(false, [this._formatError(message)]);
          }
        } catch (error) {
          if (error.message.includes('timeout')) {
            return new ValidationResult(false, [
              this._formatError(
                'Pattern validation timeout - pattern too complex'
              )
            ]);
          }
          return new ValidationResult(false, [
            this._formatError('Pattern validation failed')
          ]);
        }
      }
      return new ValidationResult(true);
    });
    return this;
  }

  when(condition, validator) {
    this.rules.push(() => {
      const shouldValidate =
        typeof condition === 'function' ? condition(this.value) : condition;

      if (shouldValidate) {
        if (typeof validator === 'function') {
          const conditionalValidator = validator(this.value);
          return conditionalValidator.validate();
        } else {
          return validator.validate();
        }
      }

      return new ValidationResult(true);
    });
    return this;
  }

  custom(validatorFn, message = 'Custom validation failed') {
    this.rules.push(() => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined || this.value === '')
      ) {
        return new ValidationResult(true);
      }

      try {
        const result = validatorFn(this.value);

        if (typeof result === 'boolean') {
          return result
            ? new ValidationResult(true)
            : new ValidationResult(false, [this._formatError(message)]);
        }

        if (result && typeof result === 'object' && 'isValid' in result) {
          return result;
        }

        if (typeof result === 'string') {
          return new ValidationResult(false, [this._formatError(result)]);
        }

        return new ValidationResult(true);
      } catch (error) {
        return new ValidationResult(false, [
          this._formatError(`Custom validation error: ${error.message}`)
        ]);
      }
    });
    return this;
  }

  customAsync(validatorFn, message = 'Async validation failed') {
    this.asyncRules.push(async () => {
      if (
        this.isOptional &&
        (this.value === null || this.value === undefined || this.value === '')
      ) {
        return new ValidationResult(true);
      }

      try {
        const result = await validatorFn(this.value);

        if (typeof result === 'boolean') {
          return result
            ? new ValidationResult(true)
            : new ValidationResult(false, [this._formatError(message)]);
        }

        if (result && typeof result === 'object' && 'isValid' in result) {
          return result;
        }

        if (typeof result === 'string') {
          return new ValidationResult(false, [this._formatError(result)]);
        }

        return new ValidationResult(true);
      } catch (error) {
        return new ValidationResult(false, [
          this._formatError(`Async validation error: ${error.message}`)
        ]);
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
        result.isValid = false;
        result.errors.push(
          this._formatError(`Validation error: ${error.message}`)
        );
      }
    }

    return result;
  }

  async validateAsync() {
    const syncResult = this.validate();

    if (!syncResult.isValid) {
      return syncResult;
    }

    const result = new ValidationResult(true, [...syncResult.errors]);

    for (const asyncRule of this.asyncRules) {
      try {
        const ruleResult = await asyncRule();
        if (!ruleResult.isValid) {
          result.isValid = false;
          result.errors.push(...ruleResult.errors);
        }
      } catch (error) {
        result.isValid = false;
        result.errors.push(
          this._formatError(`Async validation error: ${error.message}`)
        );
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
      .transform((v) => (typeof v === 'string' ? v.trim().toLowerCase() : v))
      .required('Email is required')
      .pattern(emailRegex, 'Invalid email format');
  },

  phone: (value, format = 'us') => {
    const phoneRegex = {
      us: /^[+]?[1]?[0-9]{10}$/,
      international: /^[+][1-9][0-9]{7,14}$/,
      simple: /^[0-9]{10,15}$/
    };

    return new BaseValidator(value)
      .required('Phone number is required')
      .custom((val) => {
        const cleaned = String(val).replace(/[^+0-9]/g, '');
        const regex = phoneRegex[format] || phoneRegex.simple;

        if (!safeRegexTestSync(regex, cleaned)) {
          return 'Invalid phone number format';
        }
        return true;
      });
  },

  creditCard: (value) => {
    const luhnCheck = (num) => {
      let sum = 0;
      let isEven = false;

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

    const validator = new BaseValidator(value).required(
      'Credit card number is required'
    );

    validator.rules.push(() => {
      if (
        validator.isOptional &&
        (validator.value === null ||
          validator.value === undefined ||
          validator.value === '')
      ) {
        return new ValidationResult(true);
      }

      if (validator.value) {
        const cleanValue = String(validator.value).replace(/\s/g, '');

        if (!safeRegexTestSync(/^\d{13,19}$/, cleanValue)) {
          return new ValidationResult(false, [
            'Credit card must be 13-19 digits'
          ]);
        }

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
      const validatorInstance =
        typeof validator === 'function' ? validator(fieldValue) : validator;

      // Set field name for better error context
      validatorInstance.setFieldName(field);

      const result = validatorInstance.validate();

      results[field] = result;
      if (!result.isValid) {
        isValid = false;
      }
    } catch (error) {
      results[field] = new ValidationResult(false, [
        `${field}: Validation setup error - ${error.message}`
      ]);
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

      const validatorInstance =
        typeof validator === 'function' ? validator(fieldValue) : validator;

      // Set field name for better error context
      validatorInstance.setFieldName(field);

      const result =
        validatorInstance.asyncRules && validatorInstance.asyncRules.length > 0
          ? await validatorInstance.validateAsync()
          : validatorInstance.validate();

      results[field] = result;
      if (!result.isValid) {
        isValid = false;
      }
    } catch (error) {
      results[field] = new ValidationResult(false, [
        `${field}: Validation setup error - ${error.message}`
      ]);
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
  validateAsync,
  safeRegexTest,
  safeRegexTestSync,
  isRegexSafe
};
