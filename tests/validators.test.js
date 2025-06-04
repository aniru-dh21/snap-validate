const { validators, validate, BaseValidator, ValidationResult } = require('../src/index');

describe('Snap Validate Tests', () => {

  describe('ValidationResult', () => {
    test('should create valid result', () => {
      const result = new ValidationResult(true);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should create invalid result with errors', () => {
      const result = new ValidationResult(false, ['Error message']);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Error message');
    });

    test('should add error and set invalid', () => {
      const result = new ValidationResult(true);
      result.addError('New error');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('New error');
    });
  });

  describe('BaseValidator', () => {
    test('should validate required field with value', () => {
      const result = new BaseValidator('test').required().validate();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail required validation for null', () => {
      const result = new BaseValidator(null).required().validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    test('should fail required validation for undefined', () => {
      const result = new BaseValidator(undefined).required().validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    test('should fail required validation for empty string', () => {
      const result = new BaseValidator('').required().validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    test('should validate min length for string', () => {
      const result = new BaseValidator('hello').min(3).validate();
      expect(result.isValid).toBe(true);
    });

    test('should fail min length for string', () => {
      const result = new BaseValidator('hi').min(5).validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum length is 5');
    });

    test('should validate min value for number', () => {
      const result = new BaseValidator(10).min(5).validate();
      expect(result.isValid).toBe(true);
    });

    test('should fail min value for number', () => {
      const result = new BaseValidator(3).min(5).validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum length is 5');
    });

    test('should validate min length for array', () => {
      const result = new BaseValidator([1, 2, 3]).min(2).validate();
      expect(result.isValid).toBe(true);
    });

    test('should fail min length for array', () => {
      const result = new BaseValidator([1]).min(3).validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum length is 3');
    });

    test('should validate max length for string', () => {
      const result = new BaseValidator('hello').max(10).validate();
      expect(result.isValid).toBe(true);
    });

    test('should fail max length for string', () => {
      const result = new BaseValidator('very long string').max(5).validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum length is 5');
    });

    test('should validate max value for number', () => {
      const result = new BaseValidator(5).max(10).validate();
      expect(result.isValid).toBe(true);
    });

    test('should fail max value for number', () => {
      const result = new BaseValidator(15).max(10).validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum length is 10');
    });

    test('should validate pattern match', () => {
      const result = new BaseValidator('abc123').pattern(/^[a-z0-9]+$/).validate();
      expect(result.isValid).toBe(true);
    });

    test('should fail pattern match', () => {
      const result = new BaseValidator('ABC123!').pattern(/^[a-z0-9]+$/).validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid format');
    });

    test('should skip validation for empty values', () => {
      const result = new BaseValidator('').min(5).max(3).pattern(/\d+/).validate();
      expect(result.isValid).toBe(true);
    });

    test('should chain multiple validation rules', () => {
      const result = new BaseValidator('test123')
        .required()
        .min(5)
        .max(10)
        .pattern(/^[a-z0-9]+$/)
        .validate();

      expect(result.isValid).toBe(true);
    });

    test('should fail on multiple chained validation rules', () => {
      const result = new BaseValidator('a')
        .required()
        .min(5)
        .max(10)
        .validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum length is 5');
    });

    test('should handle validation errors gracefully', () => {
      const validator = new BaseValidator('test');
      validator.rules.push(() => {
        throw new Error('Test error');
      });

      const result = validator.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Validation error: Test error');
    });
  });

  describe('Email Validation', () => {
    test('should validate correct email', () => {
      const result = validators.email('test@example.com').validate();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate email with subdomain', () => {
      const result = validators.email('user@mail.example.com').validate();
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid email format', () => {
      const result = validators.email('invalid-email').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    test('should reject email without @', () => {
      const result = validators.email('testexample.com').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    test('should reject empty email', () => {
      const result = validators.email('').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    test('should reject null email', () => {
      const result = validators.email(null).validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });
  });

  describe('Phone Validation', () => {
    test('should validate US phone number with parentheses', () => {
      const result = validators.phone('(555) 123-4567', 'us').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate US phone number with dashes', () => {
      const result = validators.phone('555-123-4567', 'us').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate US phone number with country code', () => {
      const result = validators.phone('+1-555-123-4567', 'us').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate simple phone format (default)', () => {
      const result = validators.phone('1234567890').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate international phone format', () => {
      const result = validators.phone('+447911123456', 'international').validate();
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid phone length', () => {
      const result = validators.phone('123').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid phone number format');
    });

    test('should reject empty phone', () => {
      const result = validators.phone('').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Phone number is required');
    });

    test('should use simple format for unknown format', () => {
      const result = validators.phone('1234567890', 'unknown').validate();
      expect(result.isValid).toBe(true);
    });
  });

  describe('Credit Card Validation', () => {
    test('should validate valid Visa test number', () => {
      const result = validators.creditCard('4532015112830366').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate valid Mastercard test number', () => {
      const result = validators.creditCard('5555555555554444').validate();
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid credit card (fails Luhn)', () => {
      const result = validators.creditCard('1234567890123456').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid credit card number');
    });

    test('should reject non-numeric credit card', () => {
      const result = validators.creditCard('abcd1234efgh5678').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Credit card must be 13-19 digits');
    });

    test('should reject too short credit card', () => {
      const result = validators.creditCard('123456789012').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Credit card must be 13-19 digits');
    });

    test('should reject too long credit card', () => {
      const result = validators.creditCard('12345678901234567890').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Credit card must be 13-19 digits');
    });

    test('should reject empty credit card', () => {
      const result = validators.creditCard('').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Credit card number is required');
    });
  });

  describe('URL Validation', () => {
    test('should validate HTTPS URL', () => {
      const result = validators.url('https://example.com').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate HTTP URL', () => {
      const result = validators.url('http://test.org/path').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate FTP URL', () => {
      const result = validators.url('ftp://files.example.com').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate URL with query parameters', () => {
      const result = validators.url('https://example.com/path?param=value').validate();
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid URL format', () => {
      const result = validators.url('not-a-url').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid URL format');
    });

    test('should reject URL without protocol', () => {
      const result = validators.url('example.com').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid URL format');
    });

    test('should reject empty URL', () => {
      const result = validators.url('').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('URL is required');
    });
  });

  describe('Password Validation', () => {
    test('should validate strong password with defaults', () => {
      const result = validators.password('StrongPass123').validate();
      expect(result.isValid).toBe(true);
    });

    test('should reject password too short', () => {
      const result = validators.password('Short1').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    test('should reject password without uppercase', () => {
      const result = validators.password('lowercase123').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    test('should reject password without lowercase', () => {
      const result = validators.password('UPPERCASE123').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    test('should reject password without numbers', () => {
      const result = validators.password('StrongPassword').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    test('should validate password with custom minimum length', () => {
      const result = validators.password('Pass123', { minLength: 6 }).validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate password with special characters when required', () => {
      const result = validators.password('Pass123!', {
        requireSpecialChars: true
      }).validate();
      expect(result.isValid).toBe(true);
    });

    test('should reject password without special characters when required', () => {
      const result = validators.password('StrongPass123', {
        requireSpecialChars: true
      }).validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    test('should validate password with custom options disabled', () => {
      const result = validators.password('weakpass', {
        minLength: 4,
        requireUppercase: false,
        requireLowercase: true,
        requireNumbers: false,
        requireSpecialChars: false
      }).validate();
      expect(result.isValid).toBe(true);
    });

    test('should reject empty password', () => {
      const result = validators.password('').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });
  });

  describe('Alphanumeric Validation', () => {
    test('should validate alphanumeric string', () => {
      const result = validators.alphanumeric('abc123').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate only letters', () => {
      const result = validators.alphanumeric('abcdef').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate only numbers', () => {
      const result = validators.alphanumeric('123456').validate();
      expect(result.isValid).toBe(true);
    });

    test('should reject special characters', () => {
      const result = validators.alphanumeric('abc123!').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Only letters and numbers are allowed');
    });

    test('should reject spaces', () => {
      const result = validators.alphanumeric('abc 123').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Only letters and numbers are allowed');
    });

    test('should reject empty string', () => {
      const result = validators.alphanumeric('').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });
  });

  describe('Numeric Validation', () => {
    test('should validate numeric string', () => {
      const result = validators.numeric('123456').validate();
      expect(result.isValid).toBe(true);
    });

    test('should reject letters', () => {
      const result = validators.numeric('abc123').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Only numbers are allowed');
    });

    test('should reject special characters', () => {
      const result = validators.numeric('123.45').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Only numbers are allowed');
    });

    test('should reject empty string', () => {
      const result = validators.numeric('').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });
  });

  describe('Zip Code Validation', () => {
    test('should validate US 5-digit zip code', () => {
      const result = validators.zipCode('12345').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate US extended zip code', () => {
      const result = validators.zipCode('12345-6789').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate Canadian postal code', () => {
      const result = validators.zipCode('K1A 0A6', 'ca').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate Canadian postal code without space', () => {
      const result = validators.zipCode('K1A0A6', 'ca').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate UK postcode', () => {
      const result = validators.zipCode('SW1A 1AA', 'uk').validate();
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid US zip code', () => {
      const result = validators.zipCode('1234').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid zip code format');
    });

    test('should reject invalid Canadian postal code', () => {
      const result = validators.zipCode('12345', 'ca').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid zip code format');
    });

    test('should default to US format for unknown country', () => {
      const result = validators.zipCode('12345', 'unknown').validate();
      expect(result.isValid).toBe(true);
    });

    test('should reject empty zip code', () => {
      const result = validators.zipCode('').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Zip code is required');
    });
  });

  describe('Schema Validation', () => {
    test('should validate complete valid schema', () => {
      const schema = {
        email: validators.email,
        phone: (value) => validators.phone(value, 'us'),
        password: validators.password
      };

      const data = {
        email: 'user@example.com',
        phone: '(555) 123-4567',
        password: 'StrongPass123'
      };

      const result = validate(schema, data);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.getErrors())).toHaveLength(0);
    });

    test('should return errors for invalid schema data', () => {
      const schema = {
        email: validators.email,
        password: validators.password
      };

      const data = {
        email: 'invalid-email',
        password: 'weak'
      };

      const result = validate(schema, data);
      expect(result.isValid).toBe(false);

      const errors = result.getErrors();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
      expect(errors.email).toContain('Invalid email format');
    });

    test('should handle missing fields in data', () => {
      const schema = {
        email: validators.email,
        phone: validators.phone
      };

      const data = {
        email: 'user@example.com'
        // phone is missing
      };

      const result = validate(schema, data);
      expect(result.isValid).toBe(false);

      const errors = result.getErrors();
      expect(errors.phone).toBeDefined();
      expect(errors.phone).toContain('Phone number is required');
    });

    test('should throw error for invalid schema', () => {
      expect(() => {
        validate(null, {});
      }).toThrow('Schema must be a valid object');

      expect(() => {
        validate('invalid', {});
      }).toThrow('Schema must be a valid object');
    });

    test('should throw error for invalid data', () => {
      const schema = { email: validators.email };

      expect(() => {
        validate(schema, null);
      }).toThrow('Data must be a valid object');

      expect(() => {
        validate(schema, 'invalid');
      }).toThrow('Data must be a valid object');
    });

    test('should handle validator function errors gracefully', () => {
      const schema = {
        test: () => {
          throw new Error('Validator setup error');
        }
      };

      const data = { test: 'value' };
      const result = validate(schema, data);

      expect(result.isValid).toBe(false);
      expect(result.errors.test.errors).toContain('Validation setup error: Validator setup error');
    });

    test('should work with BaseValidator instances directly', () => {
      const schema = {
        username: new BaseValidator('testuser').required().min(3).max(20).pattern(/^[a-zA-Z0-9]+$/)
      };

      const data = { username: 'testuser' };
      const result = validate(schema, data);

      expect(result.isValid).toBe(true);
    });
  });
});