# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.3] - 2025-07-13

### 🔧 TypeScript Support

#### Complete TypeScript Definitions
- **Full Type Safety** - Added comprehensive TypeScript definitions for all library functions and classes
- **Type-Safe Validation** - Complete type definitions for `BaseValidator` class with all methods
- **Schema Validation Types** - Proper typing for schema validation functions and results
- **Security Function Types** - Type definitions for all security utility functions

#### Enhanced Developer Experience
- **IntelliSense Support** - Full IDE support with auto-completion and parameter hints
- **Type Checking** - Compile-time validation of method usage and parameter types
- **JSDoc Integration** - Rich documentation comments visible in IDE tooltips
- **Generic Support** - Proper generic types for flexible validation workflows

### Added

#### TypeScript Definitions
- **`BaseValidator<T>`** - Generic base validator class with full method typing
- **`ValidationResult`** - Interface for validation results with `isValid` and `errors` properties
- **`ValidatorFunction`** - Type for validator functions used in schemas
- **`ValidationSchema`** - Type for validation schema objects
- **`PasswordOptions`** - Interface for password validation configuration
- **Security utility function types** - Complete typing for `isRegexSafe`, `safeRegexTest`, etc.

#### Type-Safe Methods
- **Async validation typing** - Proper `Promise<ValidationResult>` return types
- **Conditional validation** - Type-safe `when()` method with condition functions
- **Custom validator typing** - Proper types for sync and async custom validation functions
- **Pattern validation** - Type-safe regex pattern validation with security checks

### Enhanced

#### Developer Experience Improvements
- **IDE Integration** - Full auto-completion support in VS Code, WebStorm, and other TypeScript-aware editors
- **Type Inference** - Smart type inference for chained validation methods
- **Error Prevention** - Compile-time errors for invalid method usage
- **Documentation** - Rich JSDoc comments for all methods and interfaces

#### Build and Development
- **TypeScript Testing** - Added type checking to development workflow
- **Export Organization** - Clean module exports with proper TypeScript visibility
- **Type Validation** - Automated type checking in CI/CD pipeline

### Examples

#### Type-Safe Validation
```typescript
import { BaseValidator, validators, validate } from 'snap-validate';

// Fully typed validator with auto-completion
const validator = new BaseValidator('test-value')
  .required('This field is required')
  .min(5, 'Must be at least 5 characters')
  .pattern(/^[a-zA-Z]+$/, 'Only letters allowed');

// Type-safe result handling
const result = validator.validate();
if (!result.isValid) {
  console.log(result.errors); // string[]
}
```

#### Schema Validation with Types
```typescript
import { ValidationSchema, validate } from 'snap-validate';

const schema: ValidationSchema = {
  email: validators.email,
  phone: (value) => validators.phone(value, 'us'),
  password: (value) => validators.password(value, {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true
  })
};

const result = validate(schema, userData);
// Full type safety and auto-completion
```

#### Async Validation Types
```typescript
import { BaseValidator } from 'snap-validate';

const asyncValidator = new BaseValidator(email)
  .email()
  .customAsync(async (email: string) => {
    const exists = await checkEmailExists(email);
    return !exists || 'Email already exists';
  }, 'Email validation failed');

// Properly typed Promise return
const result: Promise<ValidationResult> = asyncValidator.validateAsync();
```

### Developer Notes
- **Zero Runtime Impact** - TypeScript definitions add no runtime overhead
- **Backward Compatibility** - All existing JavaScript usage continues to work unchanged
- **IDE Support** - Enhanced development experience with full IntelliSense support
- **Type Safety** - Compile-time validation prevents common usage errors

### Migration for TypeScript Users
- **No Breaking Changes** - Existing code continues to work without modifications
- **Gradual Adoption** - TypeScript users can gradually add type annotations
- **IDE Benefits** - Immediate improvement in development experience with auto-completion

## [0.3.1] - 2025-07-06

### 🔒 Security Fixes

#### Critical ReDoS Protection
- **ReDoS Vulnerability Fixed** - Resolved polynomial regular expression vulnerability in `pattern()` method (Line 116)
- **Regex Safety Detection** - Added `isRegexSafe()` function to detect potentially dangerous regex patterns before execution
  - Detects nested quantifiers like `(a+)+` or `(a*)*`
  - Identifies catastrophic backtracking patterns
  - Prevents exponential alternation patterns
  - Blocks multiple consecutive quantifiers
- **Input Length Protection** - Added 10,000 character limit for regex pattern validation to prevent ReDoS attacks
- **Timeout Protection** - Added `safeRegexText()` function with configurable timeout protection (default: 1 second)

#### Enhanced Security Features
- **Pattern Validation Enhancement** - The `pattern()` method now validates regex safety before execution
- **Async Pattern Validation** - New `patternAsync()` method for complex patterns requiring timeout protection
- **Configurable Timeouts** - Added `setRegexTimeout()` method for custom timeout settings
- **Safe Defaults** - All predefined validators now use simplified, safe regex patterns

### Added

#### New Security Methods
- **`isRegexSafe(regex)`** - Utility function to check if a regex pattern is safe to use
- **`safeRegexText(regex, str, timeoutMs)`** - Execute regex with timeout protection
- **`patternAsync(regex, message)`** - Async pattern validation with built-in timeout protection
- **`setRegexTimeout(timeoutMs)`** - Configure custom timeout for regex operations

#### Enhanced Error Handling
- **Security Error Messages** - Clear error messages for regex safety violations and timeouts
- **Timeout Error Handling** - Proper handling of regex timeout scenarios
- **Pattern Complexity Detection** - Automatic detection and prevention of complex regex patterns

### Enhanced

#### Predefined Validators Security Updates
- **Phone Validator** - Simplified regex patterns to prevent ReDoS detection
  - US format: `/^[+]?[1]?[0-9]{10}$/`
  - International format: `/^[+][1-9][0-9]{7,14}$/`
  - Simple format: `/^[0-9]{10,15}$/`
- **All Validators** - Enhanced with safety checks and input length limits
- **Pattern Testing** - Improved null/undefined handling with string conversion

#### Performance Improvements
- **Faster Regex Execution** - Optimized regex patterns for better performance
- **Memory Efficiency** - Reduced memory usage with input length limits
- **Error Boundary Protection** - Better error handling to prevent crashes

### Examples

#### Security-First Validation
```javascript
// Automatic safety checks
const validator = new BaseValidator(value)
  .pattern(/^[a-zA-Z0-9]+$/, 'Only alphanumeric characters allowed');

// Custom timeout configuration
const safeValidator = new BaseValidator(value)
  .setRegexTimeout(5000) // 5 second timeout
  .patternAsync(/complex-pattern/, 'Error message');

// Manual safety checking
const { isRegexSafe } = require('snap-validate');
if (isRegexSafe(userPattern)) {
  // Safe to use
} else {
  // Handle unsafe pattern
}
```

#### Async Pattern Validation
```javascript
const validator = new BaseValidator(value)
  .patternAsync(/^[a-zA-Z0-9]+$/, 'Only alphanumeric characters allowed');

const result = await validator.validateAsync();
```

### Security Notes
- **Breaking Change Prevention** - All security fixes maintain backward compatibility
- **Performance Impact** - Minimal performance impact with significant security improvements
- **Default Safety** - All operations are secure by default with configurable options for advanced use cases

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

## [0.2.1] - 2025-06-04

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

## [0.1.0] - 2025-06-01

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

### Security Policy
- **Current version** (0.3.3): Full support with security fixes, new features, and bug fixes
- **Previous version** (0.3.1): Security fixes and critical bug fixes only
- **Older versions** (0.3.0 and below): Limited support, upgrade recommended for latest features

### Security Alerts
- **v0.3.1**: Fixes critical ReDoS vulnerability (CVE-pending)
- **Recommendation**: Upgrade immediately from versions < 0.3.1

### Migration Guides
For major version upgrades, see our [Migration Guide](MIGRATION.md) for detailed instructions on updating your code.

<!--### Security Reporting
If you discover a security vulnerability, please report it privately to our security team at security@snap-validate.com instead of creating a public issue.-->
