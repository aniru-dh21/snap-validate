# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-06-08

### Added

#### Conditional Validation
- **`when(condition, validator)`** - Execute validation only when condition is met
  - Supports both function and boolean conditions
  - Seamlessly integrates with existing validation chains
  - Enables complex conditional validation logic
- **`optional()`** - Skip validation for empty/null/undefined fields
  - Automatically handles common optional field scenarios
  - Works with all existing validators

#### Custom Validators
- **`custom(fn, message)`** - Add synchronous custom validation logic
  - Flexible return types: boolean, ValidationResult object, or error string
  - Comprehensive error handling for custom validation functions
  - Full integration with validator chaining
- **`customAsync(fn, message)`** - Support for asynchronous custom validation
  - Perfect for database checks, API calls, and external validations
  - Maintains consistent API with synchronous validators
  - Proper error handling and timeout support

#### Async Validation Support
- **`validateAsync()`** method on BaseValidator
  - Returns Promise-based validation results
  - Runs synchronous validations first, then asynchronous ones
  - Maintains same result structure as synchronous validation
- **`validateAsync(schema, data)`** function for schema validation
  - Full async support for complex validation schemas
  - Parallel execution of async validations for better performance
  - Consistent error handling across sync and async operations

### Enhanced
- **Validation chaining** - All new methods work seamlessly with existing validation chains
- **Error handling** - Improved error messages and exception handling for custom validators
- **Performance** - Optimized async validation execution with proper error boundaries

### Examples
```javascript
// Conditional validation
const validator = new BaseValidator(value)
  .when(user.isAdmin, validators.required('Admin field required'))
  .optional()
  .min(5);

// Custom synchronous validation
const customValidator = new BaseValidator(value)
  .custom((val) => val !== 'forbidden', 'Value cannot be forbidden')
  .required();

// Custom asynchronous validation
const asyncValidator = new BaseValidator(email)
  .email()
  .customAsync(async (email) => {
    const exists = await checkEmailExists(email);
    return !exists || 'Email already exists';
  }, 'Email validation failed');

const result = await asyncValidator.validateAsync();
```

## [0.2.1] - 2025-05-15

### Fixed

#### Critical Bug Fixes
- **Pattern Validation Fix** - Resolved issue where patterns were tested on null/undefined values, causing validation errors
- **Type safety improvements** - Added proper type checking and string conversion before regex testing
- **Luhn algorithm enhancement** - Fixed credit card validation with better null/undefined handling and string processing

#### Enhanced Error Handling
- **Robust error handling** - Added comprehensive try-catch blocks in validation methods
- **Input validation** - Added validation for schema and data parameters in main `validate()` function
- **Graceful degradation** - Improved handling of edge cases with null/undefined values
- **Detailed error messages** - More descriptive and consistent error messages throughout the library

### Enhanced

#### Validation Improvements
- **Enhanced min/max validation** - Better support for strings, arrays, and numbers with proper type checking
- **Safer regex handling** - Fixed potential undefined regex issues in phone and zipCode validators
- **Value handling** - Improved null/undefined checking using `!= null` pattern
- **Credit card validation** - Enhanced Luhn algorithm implementation with better error handling

#### Test Suite Enhancements
- **ValidationResult testing** - Added comprehensive tests for the core ValidationResult class
- **BaseValidator coverage** - Complete testing of all chaining methods (required, min, max, pattern)
- **Enhanced validator tests** - More thorough testing of all predefined validators with edge cases
- **Schema validation tests** - Improved testing of the main validate function with error scenarios
- **Error handling tests** - Added tests for validation exceptions and setup errors

### Added

#### New Features
- **Multi-type min/max support** - `min()` and `max()` methods now properly handle strings, arrays, and numbers
- **Better phone format handling** - Improved fallback for unknown phone number formats
- **Enhanced zip code support** - Better handling of international postal code formats

## [0.1.0] - 2025-04-01

### Added
- **Initial release** of snap-validate
- **Core validation patterns**
  - Email validation with comprehensive regex
  - Phone number validation (US, international, simple formats)
  - Credit card validation using Luhn algorithm
  - URL validation with protocol support
  - Password validation with customizable requirements
  - Alphanumeric and numeric validation
  - Zip code validation (US, CA, UK formats)
- **Schema validation support** - Validate entire objects against defined schemas
- **BaseValidator class** - Chainable validation with required, min, max, and pattern methods
- **Comprehensive test suite** - High code coverage with extensive edge case testing
- **CI/CD pipeline** - Automated testing and deployment
- **Lightning-fast performance** - Zero dependencies, optimized for speed
- **Cross-platform support** - Works in Node.js and browsers
- **TypeScript-friendly** - Clean API design for type inference

### Performance
- **Zero external dependencies** - Minimal footprint and fast installation
- **Optimized algorithms** - Fast regex patterns and efficient validation logic
- **Memory efficient** - Minimal object creation and smart caching

---

## Release Notes

### Version Numbering
This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

### Support Policy
- **Current version** (0.3.x): Full support with new features and bug fixes
- **Previous version** (0.2.x): Security fixes and critical bug fixes only
- **Older versions** (0.1.x): No longer supported, upgrade recommended

### Migration Guides
For major version upgrades, see our [Migration Guide](MIGRATION.md) for detailed instructions on updating your code.