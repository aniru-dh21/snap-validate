#!/usr/bin/env node

const { validators, validate, validateAsync, BaseValidator } = require('../src/index');

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

console.log('\n5. URL Validation:');
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
    if (!result.isValid) {
        console.log(`    Errors: ${result.errors.join(', ')}`);
    }
});

console.log('\n6. Zip Code Validation:');
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
    if (!result.isValid) {
        console.log(`    Errors: ${result.errors.join(', ')}`);
    }
});

console.log('\n7. Alphanumeric and Numeric Validation:');
const alphanumericTests = ['hello123', 'test@email', 'validText', '12345'];
const numericTests = ['12345', 'abc123', '001', 'not-numeric'];

console.log('  Alphanumeric:');
alphanumericTests.forEach(value => {
    const result = validators.alphanumeric(value).validate();
    console.log(`    ${value}: ${result.isValid ? '✅' : '❌'}`);
});

console.log('  Numeric:');
numericTests.forEach(value => {
    const result = validators.numeric(value).validate();
    console.log(`    ${value}: ${result.isValid ? '✅' : '❌'}`);
});

console.log('\n8. Custom Validation with BaseValidator:');
const customValidator = new BaseValidator('testuser123')
    .required('Username is required')
    .min(5, 'Username must be at least 5 characters')
    .max(20, 'Username must be less than 20 characters')
    .pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

const customResult = customValidator.validate();
console.log(`  Custom validation: ${customResult.isValid ? '✅' : '❌'}`);

console.log('\n9. Optional Fields:');
const optionalValidator = new BaseValidator('')
    .optional()
    .min(3, 'If provided, must be at least 3 characters')
    .pattern(/^[a-zA-Z]+$/, 'Only letters allowed');

const optionalResult = optionalValidator.validate();
console.log(`  Optional empty field: ${optionalResult.isValid ? '✅' : '❌'}`);

const optionalWithValue = new BaseValidator('ab')
    .optional()
    .min(3, 'If provided, must be at least 3 characters');

const optionalWithValueResult = optionalWithValue.validate();
console.log(`  Optional with invalid value: ${optionalWithValueResult.isValid ? '✅' : '❌'}`);
if (!optionalWithValueResult.isValid) {
    console.log(`    Errors: ${optionalWithValueResult.errors.join(', ')}`);
}

console.log('\n10. Conditional Validation (when):');
const conditionalValidator = new BaseValidator('premium')
    .required('Account type is required')
    .when(
        value => value === 'premium',
        value => new BaseValidator(value).pattern(/^premium$/, 'Premium account must be exactly "premium"')
    );

const conditionalResult = conditionalValidator.validate();
console.log(`  Conditional validation: ${conditionalResult.isValid ? '✅' : '❌'}`);

console.log('\n11. Custom Validation Functions:');
const customFnValidator = new BaseValidator('hello@world.com')
    .required('Email is required')
    .custom(value => {
        // Custom validation: check if email domain is allowed
        const allowedDomains = ['example.com', 'test.org', 'world.com'];
        const domain = value.split('@')[1];
        return allowedDomains.includes(domain) || 'Email domain not allowed';
    });

const customFnResult = customFnValidator.validate();
console.log(`  Custom function validation: ${customFnResult.isValid ? '✅' : '❌'}`);

console.log('\n12. Schema Validation:');
const userSchema = {
    email: validators.email,
    phone: (value) => validators.phone(value, 'us'),
    password: (value) => validators.password(value, {
        minLength: 8,
        requireSpecialChars: true
    }),
    zipCode: (value) => validators.zipCode(value, 'us'),
    username: (value) => new BaseValidator(value)
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username cannot exceed 20 characters')
        .pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
};

const userData = {
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    password: 'SecurePass123!',
    zipCode: '12345',
    username: 'johndoe123'
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

console.log('\n13. Advanced Password Validation:');
const advancedPasswordTests = [
    { password: 'SimplePass123!', options: { minLength: 12, requireSpecialChars: true } },
    { password: 'short', options: { minLength: 8 } },
    { password: 'NoSpecialChars123', options: { requireSpecialChars: true } },
    { password: 'validpassword123', options: { requireUppercase: false } }
];

advancedPasswordTests.forEach(({ password, options }) => {
    const result = validators.password(password, options).validate();
    console.log(`  ${password} (${JSON.stringify(options)}): ${result.isValid ? '✅' : '❌'}`);
    if (!result.isValid) {
        console.log(`    Errors: ${result.errors.join(', ')}`);
    }
});

// Async validation example
console.log('\n14. Async Validation Example:');
async function runAsyncExample() {
    const asyncValidator = new BaseValidator('testuser')
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .customAsync(async (value) => {
            // Simulate async operation (e.g., checking if username exists)
            return new Promise(resolve => {
                setTimeout(() => {
                    const existingUsers = ['admin', 'root', 'testuser'];
                    resolve(!existingUsers.includes(value) || 'Username already exists');
                }, 100);
            });
        });

    try {
        const asyncResult = await asyncValidator.validateAsync();
        console.log(`  Async validation: ${asyncResult.isValid ? '✅' : '❌'}`);
        if (!asyncResult.isValid) {
            console.log(`    Errors: ${asyncResult.errors.join(', ')}`);
        }
    } catch (error) {
        console.log(`  Async validation error: ${error.message}`);
    }

    console.log('\n✨ All examples completed!');
}

runAsyncExample();