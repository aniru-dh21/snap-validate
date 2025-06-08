# Snap Validate ⚡

[![npm version](https://img.shields.io/npm/v/snap-validate.svg?style=flat-square)](https://www.npmjs.com/package/snap-validate)
[![Build Status](https://github.com/aniru-dh21/snap-validate/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/aniru-dh21/snap-validate/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/snap-validate.svg?style=flat-square)](https://npm-stat.com/charts.html?package=snap-validate)

A lightning-fast, lightweight validation library for common patterns without heavy dependencies. Perfect for client-side and server-side validation with zero external dependencies.

## Features

- ⚡ **Lightning Fast**: Optimized for speed and performance
- 🚀 **Lightweight**: No external dependencies, minimal footprint
- 🔧 **Flexible**: Chainable validation rules and custom validators
- 📧 **Common Patterns**: Email, phone, credit card, URL, password validation
- 🌍 **International**: Support for different formats (US/International phone, postal codes)
- 🔄 **Async Support**: Full async validation support for database checks and API calls
- 🎯 **Conditional**: Advanced conditional validation with `when()` and `optional()`
- 🛠️ **Custom Validators**: Add your own sync and async validation logic
- 🧪 **Well Tested**: Comprehensive test suite with high coverage
- 📦 **Easy Integration**: Works in Node.js and browsers
- 🔗 **Chainable API**: Intuitive fluent interface

## Installation

```bash
npm install snap-validate
```

## Quick Start

```javascript
const { validators, validate } = require('snap-validate');

// Single field validation
const emailResult = validators.email('user@example.com').validate();
console.log(emailResult.isValid); // true

// Schema validation
const schema = {
  email: validators.email,
  phone: (value) => validators.phone(value, 'us'),
  password: validators.password
};

const data = {
  email: 'user@example.com',
  phone: '(555) 123-4567',
  password: 'SecurePass123'
};

const result = validate(schema, data);
console.log(result.isValid); // true
```

## Available Validators

### Email Validation

```javascript
validators.email('user@example.com').validate();
```

### Phone Number Validation

```javascript
// US format (default)
validators.phone('(555) 123-4567').validate();

// International format
validators.phone('+1234567890', 'international').validate();

// Simple numeric
validators.phone('1234567890', 'simple').validate();
```

### Credit Card Validation

```javascript
// Uses Luhn algorithm
validators.creditCard('4532015112830366').validate();
```

### URL Validation

```javascript
validators.url('https://example.com').validate();
```

### Password Validation

```javascript
// Default: min 8 chars, requires upper, lower, numbers
validators.password('SecurePass123').validate();

// Custom options
validators.password('MyPass123!', {
  minLength: 10,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
}).validate();
```

### Alphanumeric Validation

```javascript
validators.alphanumeric('ABC123').validate();
```

### Numeric Validation

```javascript
validators.numeric('12345').validate();
```

### Zip Code Validation

```javascript
// US zip code
validators.zipCode('12345').validate();
validators.zipCode('12345-6789').validate();

// Canadian postal code
validators.zipCode('K1A 0A6', 'ca').validate();

// UK postal code
validators.zipCode('SW1A 1AA', 'uk').validate();
```

## Advanced Validation Features

### Conditional Validation

```javascript
const { BaseValidator } = require('snap-validate');

// Validate only when condition is met
const validator = new BaseValidator(value)
  .when(user.isAdmin, validators.required('Admin field required'))
  .min(5, 'Must be at least 5 characters');

// Optional validation - skip if empty/null/undefined
const optionalValidator = new BaseValidator(value)
  .optional()
  .email('Must be a valid email if provided');

// Function-based conditions
const conditionalValidator = new BaseValidator(value)
  .when(() => user.role === 'admin', validators.required())
  .max(100);
```

### Custom Validators

```javascript
const { BaseValidator } = require('snap-validate');

// Synchronous custom validation
const customValidator = new BaseValidator(value)
  .custom((val) => val !== 'forbidden', 'Value cannot be forbidden')
  .custom((val) => {
    if (val.includes('admin') && !user.isAdmin) {
      return 'Only admins can use this value';
    }
    return true;
  });

// Asynchronous custom validation
const asyncValidator = new BaseValidator(email)
  .email()
  .customAsync(async (email) => {
    const exists = await checkEmailExists(email);
    return !exists || 'Email already exists';
  }, 'Email validation failed');

// Use async validation
const result = await asyncValidator.validateAsync();
```

### Async Validation

```javascript
// Async validation for single field
const validator = new BaseValidator(username)
  .required()
  .min(3)
  .customAsync(async (username) => {
    const available = await checkUsernameAvailable(username);
    return available || 'Username is already taken';
  });

const result = await validator.validateAsync();

// Async schema validation
const asyncSchema = {
  username: (value) => new BaseValidator(value)
    .required()
    .customAsync(async (val) => {
      const available = await checkUsernameAvailable(val);
      return available || 'Username taken';
    }),
  
  email: (value) => validators.email(value)
    .customAsync(async (val) => {
      const exists = await checkEmailExists(val);
      return !exists || 'Email already registered';
    })
};

const asyncResult = await validate.async(asyncSchema, userData);
```

## Custom Validation

### Using BaseValidator

```javascript
const { BaseValidator } = require('snap-validate');

const customValidator = new BaseValidator('test-value')
  .required('This field is required')
  .min(5, 'Must be at least 5 characters')
  .max(20, 'Must be no more than 20 characters')
  .pattern(/^[a-zA-Z]+$/, 'Only letters allowed');

const result = customValidator.validate();
```

### Schema Validation with Custom Rules

```javascript
const schema = {
  username: (value) => new BaseValidator(value)
    .required()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  email: validators.email,
  
  age: (value) => new BaseValidator(value)
    .required()
    .pattern(/^\d+$/, 'Age must be a number')
    .custom((val) => parseInt(val) >= 18, 'Must be 18 or older')
};

const userData = {
  username: 'john_doe',
  email: 'john@example.com',
  age: '25'
};

const result = validate(schema, userData);
```

## Error Handling

```javascript
const result = validators.email('invalid-email').validate();

if (!result.isValid) {
  console.log('Validation errors:', result.errors);
  // Output: ['Invalid email format']
}

// For schema validation
const schemaResult = validate(schema, data);
if (!schemaResult.isValid) {
  const errors = schemaResult.getErrors();
  console.log('Field errors:', errors);
  // Output: { email: ['Invalid email format'], password: ['Password too weak'] }
}

// Async error handling
try {
  const asyncResult = await validator.validateAsync();
  if (!asyncResult.isValid) {
    console.log('Async validation errors:', asyncResult.errors);
  }
} catch (error) {
  console.log('Validation exception:', error.message);
}
```

## Browser Usage

```html
<script src="https://unpkg.com/snap-validate/src/index.js"></script>
<script>
  const { validators } = SnapValidate;
  
  const result = validators.email('user@example.com').validate();
  console.log(result.isValid);
</script>
```

## API Reference

### ValidationResult

- `isValid: boolean` - Whether validation passed
- `errors: string[]` - Array of error messages

### BaseValidator Methods

- `required(message?)` - Field is required
- `min(length, message?)` - Minimum length validation
- `max(length, message?)` - Maximum length validation
- `pattern(regex, message?)` - Pattern matching validation
- `when(condition, validator)` - Conditional validation
- `optional()` - Skip validation if empty/null/undefined
- `custom(fn, message?)` - Custom synchronous validation
- `customAsync(fn, message?)` - Custom asynchronous validation
- `validate()` - Execute synchronous validation
- `validateAsync()` - Execute asynchronous validation

### Available Validators

- `validators.email(value)`
- `validators.phone(value, format?)`
- `validators.creditCard(value)`
- `validators.url(value)`
- `validators.password(value, options?)`
- `validators.alphanumeric(value)`
- `validators.numeric(value)`
- `validators.zipCode(value, country?)`

### Validation Functions

- `validate(schema, data)` - Synchronous schema validation
- `validate.async(schema, data)` - Asynchronous schema validation

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

---

Made with ⚡ by [Ramachandra Anirudh Vemulapalli](https://github.com/aniru-dh21)