/**
 * Snap Validate - Phase 1 Test Suite
 * Tests for arrays, nested objects, transforms, and new methods
 */

const {
  BaseValidator,
  validators,
  validate,
  validateAsync
} = require('../src/index');

describe('Phase 1: Array Validation', () => {
  test('array() - validates array type', () => {
    const result = new BaseValidator([1, 2, 3]).array().validate();
    expect(result.isValid).toBe(true);
  });

  test('array() - rejects non-arrays', () => {
    const result = new BaseValidator('not array').array().validate();
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('array');
  });

  test('array() - works with optional', () => {
    const result = new BaseValidator(null).optional().array().validate();
    expect(result.isValid).toBe(true);
  });

  test('arrayOf() - validates array items with validator', () => {
    const emails = ['john@test.com', 'jane@test.com'];
    const result = new BaseValidator(emails)
      .array()
      .arrayOf(validators.email)
      .validate();
    expect(result.isValid).toBe(true);
  });

  test('arrayOf() - detects invalid items', () => {
    const emails = ['john@test.com', 'invalid-email', 'jane@test.com'];
    const result = new BaseValidator(emails)
      .array()
      .arrayOf(validators.email)
      .validate();
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('[1]'); // Item at index 1
  });

  test('arrayOf() - works with custom validators', () => {
    const numbers = [5, 10, 15];
    const result = new BaseValidator(numbers)
      .array()
      .arrayOf((value) => new BaseValidator(value).between(1, 20))
      .validate();
    expect(result.isValid).toBe(true);
  });

  test('array with min/max length', () => {
    const result = new BaseValidator([1, 2, 3])
      .array()
      .min(2)
      .max(5)
      .validate();
    expect(result.isValid).toBe(true);
  });
});

describe('Phase 1: Nested Object Validation', () => {
  test('object() - validates nested object structure', () => {
    const address = {
      street: '123 Main St',
      city: 'Springfield',
      zipCode: '12345'
    };

    const schema = {
      street: (v) => new BaseValidator(v).required().min(3),
      city: (v) => new BaseValidator(v).required(),
      zipCode: (v) => validators.zipCode(v, 'us')
    };

    const result = new BaseValidator(address).object(schema).validate();
    expect(result.isValid).toBe(true);
  });

  test('object() - detects invalid nested fields', () => {
    const address = {
      street: 'AB', // Too short
      city: 'Springfield',
      zipCode: 'invalid'
    };

    const schema = {
      street: (v) => new BaseValidator(v).required().min(3),
      city: (v) => new BaseValidator(v).required(),
      zipCode: (v) => validators.zipCode(v, 'us')
    };

    const result = new BaseValidator(address).object(schema).validate();
    expect(result.isValid).toBe(false);
  });

  test('object() - rejects non-objects', () => {
    const result = new BaseValidator('not object').object({}).validate();
    expect(result.isValid).toBe(false);
  });

  test('object() - rejects arrays', () => {
    const result = new BaseValidator([1, 2, 3]).object({}).validate();
    expect(result.isValid).toBe(false);
  });

  test('object() - works with optional', () => {
    const result = new BaseValidator(null).optional().object({}).validate();
    expect(result.isValid).toBe(true);
  });

  test('deeply nested objects', () => {
    const userData = {
      profile: {
        address: {
          street: '123 Main St',
          city: 'Springfield'
        }
      }
    };

    const addressSchema = {
      street: (v) => new BaseValidator(v).required(),
      city: (v) => new BaseValidator(v).required()
    };

    const profileSchema = {
      address: (v) => new BaseValidator(v).object(addressSchema)
    };

    const userSchema = {
      profile: (v) => new BaseValidator(v).object(profileSchema)
    };

    const result = validate(userSchema, userData);
    expect(result.isValid).toBe(true);
  });
});

describe('Phase 1: Transform', () => {
  test('transform() - modifies value before validation', () => {
    const validator = new BaseValidator('  hello  ')
      .transform((v) => v.trim())
      .transform((v) => v.toUpperCase());

    const result = validator.validate();
    expect(validator.value).toBe('HELLO');
    expect(result.isValid).toBe(true);
  });

  test('transform() - works in chain with other validators', () => {
    const result = new BaseValidator('  test@example.com  ')
      .transform((v) => v.trim().toLowerCase())
      .pattern(/^[a-z@.]+$/, 'Must be lowercase')
      .validate();
    expect(result.isValid).toBe(true);
  });

  test('email validator auto-transforms', () => {
    const result = validators.email('  JOHN@EXAMPLE.COM  ').validate();
    expect(result.isValid).toBe(true);
  });

  test('transform() - handles errors gracefully', () => {
    const result = new BaseValidator('test')
      .transform(() => {
        throw new Error('Transform failed');
      })
      .validate();
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Transform');
  });
});

describe('Phase 1: New Methods', () => {
  test('equals() - validates equality', () => {
    const result = new BaseValidator('admin').equals('admin').validate();
    expect(result.isValid).toBe(true);
  });

  test('equals() - detects inequality', () => {
    const result = new BaseValidator('user').equals('admin').validate();
    expect(result.isValid).toBe(false);
  });

  test('oneOf() - validates allowed values', () => {
    const result = new BaseValidator('admin')
      .oneOf(['admin', 'user', 'guest'])
      .validate();
    expect(result.isValid).toBe(true);
  });

  test('oneOf() - rejects invalid values', () => {
    const result = new BaseValidator('superadmin')
      .oneOf(['admin', 'user', 'guest'])
      .validate();
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('admin, user, guest');
  });

  test('between() - validates number range', () => {
    const result = new BaseValidator(25).between(18, 65).validate();
    expect(result.isValid).toBe(true);
  });

  test('between() - rejects out of range', () => {
    const result = new BaseValidator(100).between(18, 65).validate();
    expect(result.isValid).toBe(false);
  });

  test('between() - works with string numbers', () => {
    const result = new BaseValidator('25').between(18, 65).validate();
    expect(result.isValid).toBe(true);
  });
});

describe('Phase 1: Error Context', () => {
  test('setFieldName() - adds field context to errors', () => {
    const result = new BaseValidator('')
      .setFieldName('email')
      .required('This field is required')
      .validate();
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('email');
  });

  test('validate() - automatically adds field names', () => {
    const schema = {
      email: (v) => new BaseValidator(v).required(),
      age: (v) => new BaseValidator(v).required()
    };

    const data = {
      email: '',
      age: ''
    };

    const result = validate(schema, data);
    const errors = result.getErrors();

    expect(errors.email[0]).toContain('email');
    expect(errors.age[0]).toContain('age');
  });
});

describe('Phase 1: Complex Integration Tests', () => {
  test('complex user validation with all features', () => {
    const schema = {
      email: validators.email,
      age: (v) =>
        new BaseValidator(v)
          .required()
          .between(18, 120, 'Age must be between 18 and 120'),

      role: (v) =>
        new BaseValidator(v).required().oneOf(['admin', 'user', 'moderator']),

      tags: (v) =>
        new BaseValidator(v)
          .optional()
          .array()
          .min(1)
          .max(5)
          .arrayOf((tag) => new BaseValidator(tag).min(3)),

      address: (v) =>
        new BaseValidator(v).required().object({
          street: (s) => new BaseValidator(s).required().min(5),
          city: (c) => new BaseValidator(c).required(),
          zipCode: (z) => validators.zipCode(z, 'us')
        })
    };

    const userData = {
      email: '  JOHN@EXAMPLE.COM  ',
      age: 25,
      role: 'admin',
      tags: ['javascript', 'nodejs'],
      address: {
        street: '123 Main Street',
        city: 'Springfield',
        zipCode: '12345'
      }
    };

    const result = validate(schema, userData);
    if (!result.isValid) {
      console.log(
        'Validation errors:',
        JSON.stringify(result.getErrors(), null, 2)
      );
    }
    expect(result.isValid).toBe(true);
  });

  test('complex validation with multiple errors', () => {
    const schema = {
      email: validators.email,
      age: (v) => new BaseValidator(v).between(18, 65),
      tags: (v) =>
        new BaseValidator(v)
          .array()
          .arrayOf((tag) => new BaseValidator(tag).min(3))
    };

    const userData = {
      email: 'invalid-email',
      age: 100,
      tags: ['ok', 'ab', 'good'] // 'ab' is too short
    };

    const result = validate(schema, userData);
    expect(result.isValid).toBe(false);

    const errors = result.getErrors();
    expect(errors.email).toBeDefined();
    expect(errors.age).toBeDefined();
    expect(errors.tags).toBeDefined();
  });

  test('array of nested objects', () => {
    const addresses = [
      { street: '123 Main St', city: 'Springfield', zipCode: '12345' },
      { street: '456 Oak Ave', city: 'Shelbyville', zipCode: '67890' }
    ];

    const addressSchema = {
      street: (v) => new BaseValidator(v).required(),
      city: (v) => new BaseValidator(v).required(),
      zipCode: (v) => validators.zipCode(v, 'us')
    };

    const result = new BaseValidator(addresses)
      .array()
      .arrayOf((addr) => new BaseValidator(addr).object(addressSchema))
      .validate();

    expect(result.isValid).toBe(true);
  });

  test('optional nested structures', () => {
    const schema = {
      mainAddress: (v) =>
        new BaseValidator(v).required().object({
          street: (s) => new BaseValidator(s).required(),
          city: (c) => new BaseValidator(c).required()
        }),

      alternateAddresses: (v) =>
        new BaseValidator(v)
          .optional()
          .array()
          .arrayOf((addr) =>
            new BaseValidator(addr).object({
              street: (s) => new BaseValidator(s).required(),
              city: (c) => new BaseValidator(c).required()
            })
          )
    };

    const data = {
      mainAddress: {
        street: '123 Main St',
        city: 'Springfield'
      }
      // alternateAddresses is undefined - should be valid because optional
    };

    const result = validate(schema, data);
    expect(result.isValid).toBe(true);
  });
});

describe('Phase 1: Async Validation', () => {
  test('arrayOfAsync() - validates items asynchronously', async () => {
    const usernames = ['john123', 'jane456'];

    const result = await new BaseValidator(usernames)
      .array()
      .arrayOfAsync((username) =>
        new BaseValidator(username).min(3).customAsync(async (u) => {
          // Simulate async check
          await new Promise((resolve) => setTimeout(resolve, 10));
          return u.length >= 5 || 'Username too short';
        })
      )
      .validateAsync();

    if (!result.isValid) {
      console.log('Validation errors:', result.errors);
    }
    expect(result.isValid).toBe(true);
  });

  test('objectAsync() - validates nested objects asynchronously', async () => {
    const userData = {
      username: 'john123',
      email: 'john@example.com'
    };

    const schema = {
      username: (v) =>
        new BaseValidator(v).required().customAsync(async (username) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return !username.includes('admin') || 'Cannot use admin';
        }),
      email: validators.email
    };

    const result = await new BaseValidator(userData)
      .objectAsync(schema)
      .validateAsync();

    expect(result.isValid).toBe(true);
  });

  test('validateAsync() with complex nested structures', async () => {
    const schema = {
      user: (v) =>
        new BaseValidator(v).objectAsync({
          username: (u) =>
            new BaseValidator(u).required().customAsync(async (name) => {
              await new Promise((resolve) => setTimeout(resolve, 5));
              return name.length >= 3 || 'Too short';
            }),
          emails: (e) =>
            new BaseValidator(e).array().arrayOfAsync((email) =>
              validators.email(email).customAsync(async (addr) => {
                await new Promise((resolve) => setTimeout(resolve, 5));
                return !addr.includes('spam') || 'Spam email';
              })
            )
        })
    };

    const data = {
      user: {
        username: 'john',
        emails: ['john@example.com', 'jane@example.com']
      }
    };

    const result = await validateAsync(schema, data);
    expect(result.isValid).toBe(true);
  });
});
