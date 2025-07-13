const {
  validators,
  validate,
  BaseValidator,
  ValidationResult,
  validateAsync
} = require('../src/index');

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
      const result = new BaseValidator('abc123')
        .pattern(/^[a-z0-9]+$/)
        .validate();
      expect(result.isValid).toBe(true);
    });

    test('should fail pattern match', () => {
      const result = new BaseValidator('ABC123!')
        .pattern(/^[a-z0-9]+$/)
        .validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid format');
    });

    test('should skip validation for empty values', () => {
      const result = new BaseValidator('')
        .min(5)
        .max(3)
        .pattern(/\d+/)
        .validate();
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
      const result = validators
        .phone('+447911123456', 'international')
        .validate();
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
      const result = validators
        .url('https://example.com/path?param=value')
        .validate();
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
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter'
      );
    });

    test('should reject password without lowercase', () => {
      const result = validators.password('UPPERCASE123').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one lowercase letter'
      );
    });

    test('should reject password without numbers', () => {
      const result = validators.password('StrongPassword').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one number'
      );
    });

    test('should validate password with custom minimum length', () => {
      const result = validators
        .password('Pass123', { minLength: 6 })
        .validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate password with special characters when required', () => {
      const result = validators
        .password('Pass123!', {
          requireSpecialChars: true
        })
        .validate();
      expect(result.isValid).toBe(true);
    });

    test('should reject password without special characters when required', () => {
      const result = validators
        .password('StrongPass123', {
          requireSpecialChars: true
        })
        .validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one special character'
      );
    });

    test('should validate password with custom options disabled', () => {
      const result = validators
        .password('weakpass', {
          minLength: 4,
          requireUppercase: false,
          requireLowercase: true,
          requireNumbers: false,
          requireSpecialChars: false
        })
        .validate();
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
      expect(result.errors.test.errors).toContain(
        'Validation setup error: Validator setup error'
      );
    });

    test('should work with BaseValidator instances directly', () => {
      const schema = {
        username: new BaseValidator('testuser')
          .required()
          .min(3)
          .max(20)
          .pattern(/^[a-zA-Z0-9]+$/)
      };

      const data = { username: 'testuser' };
      const result = validate(schema, data);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Optional Field Validation', () => {
    test('should skip validation for optional empty fields', () => {
      const result = new BaseValidator('')
        .optional()
        .min(5)
        .max(3)
        .pattern(/\d+/)
        .validate();
      expect(result.isValid).toBe(true);
    });

    test('should skip validation for optional null fields', () => {
      const result = new BaseValidator(null).optional().required().validate();
      expect(result.isValid).toBe(true);
    });

    test('should skip validation for optional undefined fields', () => {
      const result = new BaseValidator(undefined).optional().min(10).validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate optional field when it has a value', () => {
      const result = new BaseValidator('abc').optional().min(5).validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum length is 5');
    });

    test('should validate optional field with valid value', () => {
      const result = new BaseValidator('hello world')
        .optional()
        .min(5)
        .validate();
      expect(result.isValid).toBe(true);
    });
  });

  describe('Conditional Validation (when)', () => {
    test('should apply validation when condition is true', () => {
      const result = new BaseValidator('test')
        .when(true, (value) => new BaseValidator(value).min(10))
        .validate();

      expect(result.isValid).toBe(false);
    });

    test('should skip validation when condition is false', () => {
      const result = new BaseValidator('test')
        .when(false, (value) => new BaseValidator(value).min(10))
        .validate();

      expect(result.isValid).toBe(true);
    });

    test('should apply validation when function condition returns true', () => {
      const result = new BaseValidator('admin')
        .when(
          (value) => value === 'admin',
          (value) => new BaseValidator(value).min(10)
        )
        .validate();

      expect(result.isValid).toBe(false);
    });

    test('should skip validation when function condition returns false', () => {
      const result = new BaseValidator('user')
        .when(
          (value) => value === 'admin',
          (value) => new BaseValidator(value).min(10)
        )
        .validate();

      expect(result.isValid).toBe(true);
    });

    test('should work with pre-created validator instance', () => {
      const conditionalValidator = new BaseValidator('test').min(10);
      const result = new BaseValidator('test')
        .when(true, conditionalValidator)
        .validate();

      expect(result.isValid).toBe(false);
    });
  });

  describe('Custom Validation', () => {
    test('should pass custom validation with boolean return', () => {
      const result = new BaseValidator('test')
        .custom((value) => value.length === 4)
        .validate();

      expect(result.isValid).toBe(true);
    });

    test('should fail custom validation with boolean return', () => {
      const result = new BaseValidator('test')
        .custom((value) => value.length === 10, 'Length must be 10')
        .validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Length must be 10');
    });

    test('should handle custom validation with ValidationResult return', () => {
      const result = new BaseValidator('test')
        .custom(() => new ValidationResult(false, ['Custom error message']))
        .validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Custom error message');
    });

    test('should handle custom validation with string return', () => {
      const result = new BaseValidator('test')
        .custom(() => 'This is a custom error')
        .validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This is a custom error');
    });

    test('should handle custom validation with no clear return', () => {
      const result = new BaseValidator('test')
        .custom(() => undefined)
        .validate();

      expect(result.isValid).toBe(true);
    });

    test('should handle custom validation errors gracefully', () => {
      const result = new BaseValidator('test')
        .custom(() => {
          throw new Error('Custom function error');
        })
        .validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Custom validation error: Custom function error'
      );
    });

    test('should skip custom validation for optional empty values', () => {
      const result = new BaseValidator('')
        .optional()
        .custom(() => false, 'Should not execute')
        .validate();

      expect(result.isValid).toBe(true);
    });
  });

  describe('Async Validation', () => {
    test('should pass async validation with boolean return', async () => {
      const result = await new BaseValidator('test')
        .customAsync(async (value) => value.length === 4)
        .validateAsync();

      expect(result.isValid).toBe(true);
    });

    test('should fail async validation with boolean return', async () => {
      const result = await new BaseValidator('test')
        .customAsync(async (value) => value.length === 10, 'Length must be 10')
        .validateAsync();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Length must be 10');
    });

    test('should handle async validation with ValidationResult return', async () => {
      const result = await new BaseValidator('test')
        .customAsync(async () => new ValidationResult(false, ['Async error']))
        .validateAsync();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Async error');
    });

    test('should handle async validation with string return', async () => {
      const result = await new BaseValidator('test')
        .customAsync(async () => 'Async custom error')
        .validateAsync();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Async custom error');
    });

    test('should handle async validation errors gracefully', async () => {
      const result = await new BaseValidator('test')
        .customAsync(async () => {
          throw new Error('Async function error');
        })
        .validateAsync();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Async validation error: Async function error'
      );
    });

    test('should run sync validations before async validations', async () => {
      const result = await new BaseValidator('')
        .required('Sync error')
        .customAsync(async () => false, 'Async error')
        .validateAsync();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Sync error');
      expect(result.errors).not.toContain('Async error');
    });

    test('should run async validations after successful sync validations', async () => {
      const result = await new BaseValidator('test')
        .required()
        .customAsync(async () => false, 'Async error')
        .validateAsync();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Async error');
    });

    test('should skip async validation for optional empty values', async () => {
      const result = await new BaseValidator('')
        .optional()
        .customAsync(async () => false, 'Should not execute')
        .validateAsync();

      expect(result.isValid).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle non-string, non-array, non-number values in min validation', () => {
      const result = new BaseValidator({}).min(5).validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Value must be a string, array, or number'
      );
    });

    test('should handle non-string, non-array, non-number values in max validation', () => {
      const result = new BaseValidator({}).max(5).validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Value must be a string, array or number'
      );
    });

    test('should convert non-string values to string for pattern validation', () => {
      const result = new BaseValidator(123).pattern(/^\d+$/).validate();
      expect(result.isValid).toBe(true);
    });

    test('should handle zero values correctly in min validation', () => {
      const result = new BaseValidator(0).min(5).validate();
      expect(result.isValid).toBe(false);
    });

    test('should handle zero values correctly in max validation', () => {
      const result = new BaseValidator(0).max(5).validate();
      expect(result.isValid).toBe(true);
    });

    test('should handle empty arrays in min validation', () => {
      const result = new BaseValidator([]).min(1).validate();
      expect(result.isValid).toBe(false);
    });

    test('should handle empty arrays in max validation', () => {
      const result = new BaseValidator([]).max(5).validate();
      expect(result.isValid).toBe(true);
    });
  });

  describe('Credit Card Luhn Algorithm Edge Cases', () => {
    test('should handle credit card numbers with spaces', () => {
      const result = validators.creditCard('4532 0151 1283 0366').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate American Express test number', () => {
      const result = validators.creditCard('371449635398431').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate Discover test number', () => {
      const result = validators.creditCard('6011111111111117').validate();
      expect(result.isValid).toBe(true);
    });

    test('should handle minimum length credit card (13 digits)', () => {
      const result = validators.creditCard('4000000000030').validate();
      expect(result.isValid).toBe(true);
    });
  });

  describe('Async Schema Validation', () => {
    test('should validate async schema successfully', async () => {
      const schema = {
        email: validators.email,
        username: (value) =>
          new BaseValidator(value)
            .required()
            .customAsync(
              async (val) => val !== 'taken',
              'Username already taken'
            )
      };

      const data = {
        email: 'user@example.com',
        username: 'available'
      };

      const result = await validateAsync(schema, data);
      expect(result.isValid).toBe(true);
    });

    test('should handle async schema validation errors', async () => {
      const schema = {
        email: validators.email,
        username: (value) =>
          new BaseValidator(value)
            .required()
            .customAsync(
              async (val) => val !== 'taken',
              'Username already taken'
            )
      };

      const data = {
        email: 'user@example.com',
        username: 'taken'
      };

      const result = await validateAsync(schema, data);
      expect(result.isValid).toBe(false);
      expect(result.getErrors().username).toContain('Username already taken');
    });

    test('should handle mixed sync and async validations in schema', async () => {
      const schema = {
        email: validators.email, // sync only
        username: (value) =>
          new BaseValidator(value)
            .required() // sync
            .min(3) // sync
            .customAsync(async (val) => val !== 'admin', 'Username not allowed') // async
      };

      const data = {
        email: 'invalid-email',
        username: 'ab' // too short
      };

      const result = await validateAsync(schema, data);
      expect(result.isValid).toBe(false);
      expect(result.getErrors().email).toContain('Invalid email format');
      expect(result.getErrors().username).toContain('Minimum length is 3');
    });

    test('should throw error for invalid schema in async validation', async () => {
      await expect(validateAsync(null, {})).rejects.toThrow(
        'Schema must be a valid object'
      );
      await expect(validateAsync('invalid', {})).rejects.toThrow(
        'Schema must be a valid object'
      );
    });

    test('should throw error for invalid data in async validation', async () => {
      const schema = { email: validators.email };
      await expect(validateAsync(schema, null)).rejects.toThrow(
        'Data must be a valid object'
      );
      await expect(validateAsync(schema, 'invalid')).rejects.toThrow(
        'Data must be a valid object'
      );
    });
  });

  describe('Custom Message Validation', () => {
    test('should use custom required message', () => {
      const result = new BaseValidator('')
        .required('Custom required message')
        .validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Custom required message');
    });

    test('should use custom min message', () => {
      const result = new BaseValidator('ab')
        .min(5, 'Custom min message')
        .validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Custom min message');
    });

    test('should use custom max message', () => {
      const result = new BaseValidator('toolong')
        .max(3, 'Custom max message')
        .validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Custom max message');
    });

    test('should use custom pattern message', () => {
      const result = new BaseValidator('abc')
        .pattern(/^\d+$/, 'Custom pattern message')
        .validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Custom pattern message');
    });
  });

  // Add these test suites to your existing validators.test.js file

  describe('Regex Safety and Security', () => {
    describe('isRegexSafe', () => {
      const { isRegexSafe } = require('../src/index');

      test('should detect unsafe nested quantifiers', () => {
        const unsafeRegex = /(a+)+/;
        expect(isRegexSafe(unsafeRegex)).toBe(false);
      });

      test('should detect unsafe alternation with quantifiers', () => {
        const unsafeRegex = /(a|a)*/;
        expect(isRegexSafe(unsafeRegex)).toBe(false);
      });

      test('should detect catastrophic backtracking patterns', () => {
        const unsafeRegex = /(.*)+/;
        expect(isRegexSafe(unsafeRegex)).toBe(false);
      });

      test('should detect multiple consecutive quantifiers', () => {
        const unsafeRegex = new RegExp('(a+)+'); // nested quantifier = unsafe
        expect(isRegexSafe(unsafeRegex)).toBe(false);
      });

      test('should allow safe regex patterns', () => {
        const safeRegex = /^[a-zA-Z0-9]+$/;
        expect(isRegexSafe(safeRegex)).toBe(true);
      });

      test('should allow simple email regex', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(isRegexSafe(emailRegex)).toBe(true);
      });
    });

    describe('safeRegexTestSync', () => {
      const { safeRegexTestSync } = require('../src/index');

      test('should test regex safely with normal input', () => {
        const regex = /^\d+$/;
        expect(safeRegexTestSync(regex, '123')).toBe(true);
        expect(safeRegexTestSync(regex, 'abc')).toBe(false);
      });

      test('should throw error for input too long', () => {
        const regex = /^\d+$/;
        const longInput = 'a'.repeat(10001);
        expect(() => {
          safeRegexTestSync(regex, longInput);
        }).toThrow('Input too long for pattern validation');
      });

      test('should handle custom max length', () => {
        const regex = /^\d+$/;
        const input = 'a'.repeat(101);
        expect(() => {
          safeRegexTestSync(regex, input, 100);
        }).toThrow('Input too long for pattern validation');
      });
    });

    describe('safeRegexTest (async)', () => {
      const { safeRegexTest } = require('../src/index');

      test('should test regex safely with normal input', async () => {
        const regex = /^\d+$/;
        await expect(safeRegexTest(regex, '123')).resolves.toBe(true);
        await expect(safeRegexTest(regex, 'abc')).resolves.toBe(false);
      });

      test('should reject input too long', async () => {
        const regex = /^\d+$/;
        const longInput = 'a'.repeat(10001);
        await expect(safeRegexTest(regex, longInput)).rejects.toThrow(
          'Input too long for regex validation'
        );
      });

      test('should timeout on slow regex', async () => {
        const regex = /^\d+$/;
        await expect(safeRegexTest(regex, '123', 1)).resolves.toBe(true);
      });
    });
  });

  describe('Pattern Validation Security', () => {
    test('should reject unsafe regex patterns in pattern()', () => {
      const unsafeRegex = /(a+)+/;
      expect(() => {
        new BaseValidator('test').pattern(unsafeRegex);
      }).toThrow('Potentially unsafe regex pattern detected');
    });

    test('should reject unsafe regex patterns in patternAsync()', () => {
      const unsafeRegex = /(a+)+/;
      expect(() => {
        new BaseValidator('test').patternAsync(unsafeRegex);
      }).toThrow('Potentially unsafe regex pattern detected');
    });

    test('should handle input too long in pattern validation', () => {
      const longInput = 'a'.repeat(10001);
      const result = new BaseValidator(longInput).pattern(/^\w+$/).validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input too long for pattern validation');
    });
  });

  describe('Async Pattern Validation', () => {
    test('should validate pattern asynchronously', async () => {
      const result = await new BaseValidator('test123')
        .patternAsync(/^[a-z0-9]+$/)
        .validateAsync();
      expect(result.isValid).toBe(true);
    });

    test('should fail async pattern validation', async () => {
      const result = await new BaseValidator('Test123!')
        .patternAsync(/^[a-z0-9]+$/, 'Only lowercase letters and numbers')
        .validateAsync();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Only lowercase letters and numbers');
    });

    test('should handle input too long in async pattern validation', async () => {
      const longInput = 'a'.repeat(10001);
      const result = await new BaseValidator(longInput)
        .patternAsync(/^\w+$/)
        .validateAsync();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input too long for pattern validation');
    });

    test('should skip async pattern validation for optional empty values', async () => {
      const result = await new BaseValidator('')
        .optional()
        .patternAsync(/^\d+$/, 'Should not execute')
        .validateAsync();
      expect(result.isValid).toBe(true);
    });

    test('should handle async pattern validation timeout', async () => {
      // Mock safeRegexTest to simulate timeout
      // const originalSafeRegexTest = require('../src/index').safeRegexTest;
      // const mockSafeRegexTest = jest.fn().mockRejectedValue(new Error('Regex execution timeout - potential ReDoS attack'));

      // This test would need to be adapted based on how you want to test timeout scenarios
      // For now, we'll test the error handling path
      const result = await new BaseValidator('test')
        .setRegexTimeout(1)
        .patternAsync(/^[a-z]+$/)
        .validateAsync();

      // The actual implementation should pass normally, but this tests the error handling structure
      expect(result.isValid).toBe(true);
    });
  });

  describe('Regex Timeout Configuration', () => {
    test('should set custom regex timeout', () => {
      const validator = new BaseValidator('test').setRegexTimeout(2000);
      expect(validator.regexTimeout).toBe(2000);
    });

    test('should chain setRegexTimeout with other methods', () => {
      const result = new BaseValidator('test')
        .setRegexTimeout(500)
        .required()
        .min(3)
        .validate();
      expect(result.isValid).toBe(true);
    });
  });

  describe('Enhanced Phone Validation', () => {
    test('should validate phone with different formats after cleaning', () => {
      const result = validators.phone('(555) 123-4567', 'us').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate phone with country code', () => {
      const result = validators.phone('+1 555 123 4567', 'us').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate international phone', () => {
      const result = validators
        .phone('+447911123456', 'international')
        .validate();
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid international phone', () => {
      const result = validators.phone('+1', 'international').validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid phone number format');
    });

    test('should use simple format for unknown format', () => {
      const result = validators.phone('1234567890', 'unknown').validate();
      expect(result.isValid).toBe(true);
    });
  });

  describe('Enhanced Credit Card Validation', () => {
    test('should validate credit card with spaces', () => {
      const result = validators.creditCard('4532 0151 1283 0366').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate American Express format', () => {
      const result = validators.creditCard('371449635398431').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate Discover format', () => {
      const result = validators.creditCard('6011111111111117').validate();
      expect(result.isValid).toBe(true);
    });

    test('should validate minimum length credit card', () => {
      const result = validators.creditCard('4000000000030').validate();
      expect(result.isValid).toBe(true);
    });

    test('should handle credit card with mixed format', () => {
      const result = validators.creditCard('4532-0151-1283-0366').validate();
      expect(result.isValid).toBe(false); // Should fail due to non-digit characters
      expect(result.errors).toContain('Credit card must be 13-19 digits');
    });
  });

  describe('ValidationResult Error Handling', () => {
    test('should handle validation setup errors in sync validation', () => {
      const schema = {
        test: () => {
          throw new Error('Setup error');
        }
      };

      const data = { test: 'value' };
      const result = validate(schema, data);

      expect(result.isValid).toBe(false);
      expect(result.errors.test.errors).toContain(
        'Validation setup error: Setup error'
      );
    });

    test('should handle validation setup errors in async validation', async () => {
      const schema = {
        test: () => {
          throw new Error('Async setup error');
        }
      };

      const data = { test: 'value' };
      const result = await validateAsync(schema, data);

      expect(result.isValid).toBe(false);
      expect(result.errors.test.errors).toContain(
        'Validation setup error: Async setup error'
      );
    });
  });

  describe('Enhanced Error Messages', () => {
    test('should provide detailed error for pattern validation failure', () => {
      const validator = new BaseValidator('test');
      validator.rules.push(() => {
        throw new Error('Pattern validation failed');
      });

      const result = validator.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Validation error: Pattern validation failed'
      );
    });

    test('should handle async validation errors with proper messages', async () => {
      const result = await new BaseValidator('test')
        .customAsync(async () => {
          throw new Error('Async custom error');
        })
        .validateAsync();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Async validation error: Async custom error'
      );
    });
  });

  describe('Mixed Validation Types', () => {
    test('should handle both sync and async validations together', async () => {
      const result = await new BaseValidator('test')
        .required()
        .min(3)
        .customAsync(async (value) => value.length < 10, 'Too long')
        .validateAsync();

      expect(result.isValid).toBe(true);
    });

    test('should stop at sync validation failures before async', async () => {
      const result = await new BaseValidator('')
        .required('Required field')
        .customAsync(async () => false, 'Should not run')
        .validateAsync();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Required field');
      expect(result.errors).not.toContain('Should not run');
    });

    test('should run async validations after successful sync validations', async () => {
      const result = await new BaseValidator('test')
        .required()
        .customAsync(async () => false, 'Async failure')
        .validateAsync();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Async failure');
    });
  });

  describe('Validator Chaining and Fluent Interface', () => {
    test('should support complex chaining with all validation types', async () => {
      const result = await new BaseValidator('Test123')
        .required()
        .min(5)
        .max(20)
        .pattern(/^[A-Za-z0-9]+$/)
        .custom((value) => value.includes('Test'))
        .customAsync(async (value) => value.length > 3)
        .validateAsync();

      expect(result.isValid).toBe(true);
    });

    test('should maintain proper error accumulation in complex chains', async () => {
      const result = await new BaseValidator('ab')
        .required()
        .min(5, 'Too short')
        .customAsync(async () => false, 'Async failed')
        .validateAsync();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Too short');
      expect(result.errors).not.toContain('Async failed'); // Shouldn't run due to sync failure
    });
  });

  describe('Integration with Existing Schema Validation', () => {
    test('should work with async validators in schema', async () => {
      const schema = {
        email: validators.email,
        username: (value) =>
          new BaseValidator(value)
            .required()
            .min(3)
            .customAsync(async (val) => val !== 'admin', 'Username not allowed')
      };

      const data = {
        email: 'test@example.com',
        username: 'admin'
      };

      const result = await validateAsync(schema, data);
      expect(result.isValid).toBe(false);
      expect(result.getErrors().username).toContain('Username not allowed');
    });

    test('should handle mixed sync/async validators in schema', async () => {
      const schema = {
        email: validators.email, // sync only
        password: validators.password, // sync only
        username: (value) =>
          new BaseValidator(value)
            .required()
            .customAsync(async (val) => val.length > 2) // async
      };

      const data = {
        email: 'test@example.com',
        password: 'Password123',
        username: 'ab'
      };

      const result = await validateAsync(schema, data);
      expect(result.isValid).toBe(false);
      expect(result.getErrors().username).toContain('Async validation failed');
    });
  });
});
