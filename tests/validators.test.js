const { validators, validate, BaseValidator } = require('../src/index');

describe('Mini Validator Tests', () => {

    describe('Email Validation', () => {
        test('should validate correct email', () => {
            const result = validators.email('test@example.com').validate();
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should reject invalid email', () => {
            const result = validators.email('invalid-email').validate();
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid email format');
        });

        test('should reject empty email', () => {
            const result = validators.email('').validate();
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Email is required');
        });
    });

    describe('Phone Validation', () => {
        test('should validate US phone number', () => {
            const result = validators.phone('(555) 123-4567', 'us').validate();
            expect(result.isValid).toBe(true);
        });

        test('should validate simple phone format', () => {
            const result = validators.phone('1234567890').validate();
            expect(result.isValid).toBe(true);
        });

        test('should reject invalid phone', () => {
            const result = validators.phone('123').validate();
            expect(result.isValid).toBe(false);
        });
    });

    describe('Credit Card Validation', () => {
        test('should validate valid credit card (Visa test number)', () => {
            const result = validators.creditCard('4532015112830366').validate();
            expect(result.isValid).toBe(true);
        });

        test('should reject invalid credit card', () => {
            const result = validators.creditCard('1234567890123456').validate();
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid credit card number');
        });

        test('should reject non-numeric credit card', () => {
            const result = validators.creditCard('abcd1234efgh5678').validate();
            expect(result.isValid).toBe(false);
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

        test('should reject invalid URL', () => {
            const result = validators.url('not-a-url').validate();
            expect(result.isValid).toBe(false);
        });
    });

    describe('Password Validation', () => {
        test('should validate strong password', () => {
            const result = validators.password('StrongPass123').validate();
            expect(result.isValid).toBe(true);
        });

        test('should reject weak password', () => {
            const result = validators.password('weak').validate();
            expect(result.isValid).toBe(false);
        });

        test('should validate password with custom options', () => {
            const result = validators.password('Pass123!', {
                minLength: 6,
                requireSpecialChars: true
            }).validate();
            expect(result.isValid).toBe(true);
        });
    });

    describe('Zip Code Validation', () => {
        test('should validate US zip code', () => {
            const result = validators.zipCode('12345').validate();
            expect(result.isValid).toBe(true);
        });

        test('should validate extended US zip code', () => {
            const result = validators.zipCode('12345-6789').validate();
            expect(result.isValid).toBe(true);
        });

        test('should validate Canadian postal code', () => {
            const result = validators.zipCode('K1A 0A6', 'ca').validate();
            expect(result.isValid).toBe(true);
        });
    });

    describe('Schema Validation', () => {
        test('should validate complete schema', () => {
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
        });

        test('should return errors for invalid schema', () => {
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
        });
    });

    describe('BaseValidator', () => {
        test('should chain validation rules', () => {
            const result = new BaseValidator('test')
                .required()
                .min(3)
                .max(10)
                .validate();

            expect(result.isValid).toBe(true);
        });

        test('should fail on chained validation', () => {
            const result = new BaseValidator('a')
                .required()
                .min(5)
                .validate();

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Minimum length is 5');
        });
    });
});