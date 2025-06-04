#!/usr/bin/env node

const { validators, validate, BaseValidator } = require('../src/index');

console.log('🛡️  Snap Validate Examples\n');

// Example 1: Basic email validation
console.log('1. Email Validation:');
const emailTests = [
    'user@example.com',
    'invalid-email',
    '',
    'test@domain.co.uk'
];

emailTests.forEach(email => {
    const result = validators.email(email).validate();
    console.log(`  ${email || '(empty)'}: ${result.isValid ? '✅' : '❌'}`);
    if (!result.isValid) {
        console.log(`    Errors: ${result.errors.join(', ')}`);
    }
});

console.log('\n2. Phone Number Validation:');
const phoneTests = [
    { value: '(555) 123-4567', format: 'us' },
    { value: '+1234567890', format: 'international' },
    { value: '1234567890', format: 'simple' },
    { value: '123', format: 'us' }
];

phoneTests.forEach(({ value, format }) => {
    const result = validators.phone(value, format).validate();
    console.log(`  ${value} (${format}): ${result.isValid ? '✅' : '❌'}`);
    if (!result.isValid) {
        console.log(`    Errors: ${result.errors.join(', ')}`);
    }
});

console.log('\n3. Credit Card Validation:');
const creditCardTests = [
    '4532015112830366', // Valid Visa test number
    '1234567890123456', // Invalid
    '4111111111111111'  // Valid Visa test number
];

creditCardTests.forEach(cc => {
    const result = validators.creditCard(cc).validate();
    console.log(`  ${cc}: ${result.isValid ? '✅' : '❌'}`);
    if (!result.isValid) {
        console.log(`    Errors: ${result.errors.join(', ')}`);
    }
});

console.log('\n4. Password Validation:');
const passwordTests = [
    'StrongPass123',
    'weak',
    'NoNumbers',
    'onlylowercase123',
    'ONLYUPPERCASE123'
];

passwordTests.forEach(password => {
    const result = validators.password(password).validate();
    console.log(`  ${password}: ${result.isValid ? '✅' : '❌'}`);
    if (!result.isValid) {
        console.log(`    Errors: ${result.errors.join(', ')}`);
    }
});

console.log('\n5. Custom Validation with BaseValidator:');
const customValidator = new BaseValidator('testuser123')
    .required('Username is required')
    .min(5, 'Username must be at least 5 characters')
    .max(20, 'Username must be less than 20 characters')
    .pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

const customResult = customValidator.validate();
console.log(`  Custom validation: ${customResult.isValid ? '✅' : '❌'}`);

console.log('\n6. Schema Validation:');
const userSchema = {
    email: validators.email,
    phone: (value) => validators.phone(value, 'us'),
    password: (value) => validators.password(value, {
        minLength: 8,
        requireSpecialChars: true
    }),
    zipCode: (value) => validators.zipCode(value, 'us')
};

const userData = {
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    password: 'SecurePass123!',
    zipCode: '12345'
};

const schemaResult = validate(userSchema, userData);
console.log(`  Schema validation: ${schemaResult.isValid ? '✅' : '❌'}`);

if (!schemaResult.isValid) {
    const errors = schemaResult.getErrors();
    console.log('   Validation errors:');
    Object.entries(errors).forEach(([field, fieldErrors]) => {
        console.log(`    ${field}: ${fieldErrors.join(', ')}`);
    });
}

console.log('\n7. URL Validation:');
const urlTests = [
    'https://example.com',
    'http://test.org/path?query=1',
    'ftp://files.example.com',
    'not-a-url',
    'https://'
];

urlTests.forEach(url => {
    const result = validators.url(url).validate();
    console.log(`  ${url}: ${result.isValid ? '✅' : '❌'}`);
});

console.log('\n8. Zip Code Validation:');
const zipTests = [
    { value: '12345', country: 'us' },
    { value: '12345-6789', country: 'us' },
    { value: 'K1A 0A6', country: 'ca' },
    { value: 'SW1A 1AA', country: 'uk' },
    { value: '123', country: 'us' }
];

zipTests.forEach(({ value, country }) => {
    const result = validators.zipCode(value, country).validate();
    console.log(`  ${value} (${country}): ${result.isValid ? '✅' : '❌'}`);
});

console.log('\n✨ All examples completed!');