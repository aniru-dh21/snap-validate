// test-types.ts - Test your TypeScript definitions
/// <reference path="./types/index.d.ts" />

import {
  validators,
  validate,
  validateAsync,
  BaseValidator,
  ValidationResult,
  PasswordOptions,
  PhoneFormat,
  CountryCode,
  Schema,
  SchemaValidationResult
} from 'snap-validate';

// Test basic validators
const emailValidator = validators.email('test@example.com');
const phoneValidator = validators.phone('123-456-7890', 'us');
const passwordValidator = validators.password('MyPassword123!', {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
});

// Test chaining
const chainedValidator = validators
  .email('test@example.com')
  .required('Email is required')
  .min(5, 'Email must be at least 5 characters')
  .max(100, 'Email must not exceed 100 characters');

// Test custom validation
const customValidator = new BaseValidator('test')
  .required()
  .custom((value: any) => {
    return value.includes('test');
  }, 'Value must contain "test"');

// Test async validation
const asyncValidator = new BaseValidator('test').customAsync(
  async (value: any) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(value.length > 0), 100);
    });
  }
);

// Test schema validation
const userSchema: Schema = {
  email: (value: any) => validators.email(value).required(),
  password: (value: any) =>
    validators.password(value, { minLength: 8 }).required(),
  age: (value: any) =>
    new BaseValidator(value).required().min(18, 'Must be 18 or older')
};

const userData = {
  email: 'user@example.com',
  password: 'SecurePass123!',
  age: 25
};

// Test synchronous validation
const syncResult: SchemaValidationResult = validate(userSchema, userData);
console.log('Sync validation result:', syncResult.isValid);

// Test asynchronous validation
validateAsync(userSchema, userData).then((result: SchemaValidationResult) => {
  console.log('Async validation result:', result.isValid);
});

// Test ValidationResult
const result = new ValidationResult(true);
result.addError('Test error');

// Test conditional validation
const conditionalValidator = new BaseValidator('test').when(
  true,
  (value: any) => new BaseValidator(value).required()
);

console.log('TypeScript definitions test completed successfully!');
