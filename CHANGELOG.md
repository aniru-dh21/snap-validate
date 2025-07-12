# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] - 2025-07-12

### Added

#### TypeScript Support Enhancement
- **Complete TypeScript Definitions** - Added comprehensive TypeScript definitions (`.d.ts`) for all library functionality
- **Enhanced Type Safety** - Full type coverage for all validators, methods, and utility functions
- **Security Function Types** - Proper typing for security utilities (`isRegexSafe`, `safeRegexTest`, `safeRegexTestSync`)
- **Async Validation Types** - Complete type definitions for async validation methods and promises

#### New TypeScript Features
- **`regexTimeout` Property** - Added to BaseValidator class with proper typing
- **`setRegexTimeout()` Method** - Type-safe timeout configuration for regex operations
- **`patternAsync()` Method** - Fully typed asynchronous pattern validation with timeout protection
- **Security Utility Types** - Comprehensive typing for all security-related functions

### Enhanced

#### Developer Experience
- **IntelliSense Support** - Full autocomplete and type checking in TypeScript and JavaScript IDEs
- **Type Documentation** - Detailed JSDoc comments for all methods and parameters
- **Error Prevention** - Compile-time type checking prevents common validation errors
- **Better IDE Integration** - Enhanced development experience with proper type hints

#### API Consistency
- **Consistent Return Types** - All validation methods now have proper return type definitions
- **Optional Parameters** - Correctly typed optional parameters throughout the API
- **Promise Types** - Proper Promise typing for all async operations

### Examples

#### TypeScript Usage
```typescript
import { validators, BaseValidator, ValidationResult } from 'snap-validate';

// Full type safety
const validator: BaseValidator = new BaseValidator('test')
  .required()
  .setRegexTimeout(5000)
  .patternAsync(/^[a-zA-Z]+$/, 'Letters only');

const result: Promise<ValidationResult> = validator.validateAsync();

// Security utilities with types
const isSafe: boolean = isRegexSafe(/^[a-zA-Z]+$/);
const testResult: Promise<boolean> = safeRegexTest(/pattern/, 'test', 1000);

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
- **Current version** (0.3.1): Full support with security fixes, new features, and bug fixes
- **Previous version** (0.3.0): Security fixes and critical bug fixes only
- **Older versions** (0.2.x and below): No longer supported, immediate upgrade recommended for security

### Security Alerts
- **v0.3.1**: Fixes critical ReDoS vulnerability (CVE-pending)
- **Recommendation**: Upgrade immediately from versions < 0.3.1

### Migration Guides
For major version upgrades, see our [Migration Guide](MIGRATION.md) for detailed instructions on updating your code.

### Security Reporting
If you discover a security vulnerability, please report it privately to our security team at security@snap-validate.com instead of creating a public issue.