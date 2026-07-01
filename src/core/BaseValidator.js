/**
 * Snap Validate - BaseValidator
 * The chainable validator. Each method pushes a rule (sync) or async rule
 * onto the instance and returns `this` for fluent chaining.
 */

const { ValidationResult } = require('./ValidationResult');
const {
  isRegexSafe,
  safeRegexTest,
  safeRegexTestSync
} = require('../utils/safeRegex');
const { validate, validateAsync } = require('../schema/validate');

class BaseValidator {
  constructor(value) {
    this.value = value;
    this.rules = [];
    this.asyncRules = [];
    this.isOptional = false;
    this.regexTimeout = 1000;
    this.fieldName = null; // Track field name for better error messages
  }

  // Set field name for contextual error messages
  setFieldName(name) {
    this.fieldName = name;
    return this;
  }

  // Helper to format error messages with field context
  _formatError(message) {
    if (
      this.fieldName &&
      !message.toLowerCase().includes(this.fieldName.toLowerCase())
    ) {
      return `${this.fieldName}: ${message}`;
    }
    return message;
  }

  // Returns true when the field is optional and effectively empty, so a rule
  // can short-circuit as valid. Pass `false` to NOT treat '' as empty
  // (array/object rules, where an empty string is a real, invalid value).
  _shouldSkipOptional(emptyStringCounts = true) {
    if (!this.isOptional) {
      return false;
    }
    const v = this.value;
    return v === null || v === undefined || (emptyStringCounts && v === '');
  }

  required(message = 'This field is required') {
    this.rules.push(() => {
      if (this._shouldSkipOptional()) {
        return new ValidationResult(true);
      }

      if (
        this.value === null ||
        this.value === undefined ||
        this.value === ''
      ) {
        return new ValidationResult(false, [this._formatError(message)]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  optional() {
    this.isOptional = true;
    return this;
  }

  setRegexTimeout(timeoutMs) {
    this.regexTimeout = timeoutMs;
    return this;
  }

  // Transform/sanitize data before validation
  transform(fn, errorMessage = 'Transform function failed') {
    this.rules.push(() => {
      if (this.value != null && this.value !== '') {
        try {
          this.value = fn(this.value);
        } catch (error) {
          return new ValidationResult(false, [
            this._formatError(`${errorMessage}: ${error.message}`)
          ]);
        }
      }
      return new ValidationResult(true);
    });
    return this;
  }

  // Check if value equals another value
  equals(compareValue, message) {
    const defaultMessage = `Must equal ${compareValue}`;
    this.rules.push(() => {
      if (this._shouldSkipOptional()) {
        return new ValidationResult(true);
      }

      if (this.value !== compareValue) {
        return new ValidationResult(false, [
          this._formatError(message || defaultMessage)
        ]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  // Check if value is one of allowed values
  oneOf(allowedValues, message) {
    const defaultMessage = `Must be one of: ${allowedValues.join(', ')}`;
    this.rules.push(() => {
      if (this._shouldSkipOptional()) {
        return new ValidationResult(true);
      }

      if (!allowedValues.includes(this.value)) {
        return new ValidationResult(false, [
          this._formatError(message || defaultMessage)
        ]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  // Check if value is between min and max (for numbers)
  between(min, max, message) {
    const defaultMessage = `Must be between ${min} and ${max}`;
    this.rules.push(() => {
      if (this._shouldSkipOptional()) {
        return new ValidationResult(true);
      }

      const numValue =
        typeof this.value === 'number' ? this.value : parseFloat(this.value);

      if (isNaN(numValue) || numValue < min || numValue > max) {
        return new ValidationResult(false, [
          this._formatError(message || defaultMessage)
        ]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  min(length, message = `Minimum length is ${length}`) {
    this.rules.push(() => {
      if (this._shouldSkipOptional()) {
        return new ValidationResult(true);
      }

      if (this.value != null && this.value !== '') {
        if (typeof this.value === 'string' || Array.isArray(this.value)) {
          if (this.value.length < length) {
            return new ValidationResult(false, [this._formatError(message)]);
          }
        } else if (typeof this.value === 'number') {
          if (this.value < length) {
            return new ValidationResult(false, [this._formatError(message)]);
          }
        } else {
          return new ValidationResult(false, [
            this._formatError('Value must be a string, array, or number')
          ]);
        }
      }
      return new ValidationResult(true);
    });
    return this;
  }

  max(length, message = `Maximum length is ${length}`) {
    this.rules.push(() => {
      if (this._shouldSkipOptional()) {
        return new ValidationResult(true);
      }

      if (this.value != null && this.value !== '') {
        if (typeof this.value === 'string' || Array.isArray(this.value)) {
          if (this.value.length > length) {
            return new ValidationResult(false, [this._formatError(message)]);
          }
        } else if (typeof this.value === 'number') {
          if (this.value > length) {
            return new ValidationResult(false, [this._formatError(message)]);
          }
        } else {
          return new ValidationResult(false, [
            this._formatError('Value must be a string, array or number')
          ]);
        }
      }
      return new ValidationResult(true);
    });
    return this;
  }

  // Validate that value is an array
  array(message = 'Must be an array') {
    this.rules.push(() => {
      if (this._shouldSkipOptional(false)) {
        return new ValidationResult(true);
      }

      if (!Array.isArray(this.value)) {
        return new ValidationResult(false, [this._formatError(message)]);
      }
      return new ValidationResult(true);
    });
    return this;
  }

  // Validate each item in an array
  arrayOf(validator, message = 'Invalid array items') {
    this.rules.push(() => {
      if (this._shouldSkipOptional(false)) {
        return new ValidationResult(true);
      }

      if (!Array.isArray(this.value)) {
        return new ValidationResult(false, [
          this._formatError('Value must be an array')
        ]);
      }

      const errors = [];
      this.value.forEach((item, index) => {
        try {
          const itemValidator =
            typeof validator === 'function' ? validator(item) : validator;
          const result = itemValidator.validate();

          if (!result.isValid) {
            errors.push(`[${index}]: ${result.errors.join(', ')}`);
          }
        } catch (error) {
          errors.push(`[${index}]: Validation error - ${error.message}`);
        }
      });

      if (errors.length > 0) {
        return new ValidationResult(false, [
          this._formatError(`${message}: ${errors.join('; ')}`)
        ]);
      }

      return new ValidationResult(true);
    });
    return this;
  }

  // Async array validation
  arrayOfAsync(validator, message = 'Invalid array items') {
    this.asyncRules.push(async () => {
      if (this._shouldSkipOptional(false)) {
        return new ValidationResult(true);
      }

      if (!Array.isArray(this.value)) {
        return new ValidationResult(false, [
          this._formatError('Value must be an array')
        ]);
      }

      const errors = [];
      for (let index = 0; index < this.value.length; index++) {
        try {
          const item = this.value[index];
          const itemValidator =
            typeof validator === 'function' ? validator(item) : validator;

          const result =
            itemValidator.asyncRules && itemValidator.asyncRules.length > 0
              ? await itemValidator.validateAsync()
              : itemValidator.validate();

          if (!result.isValid) {
            errors.push(`[${index}]: ${result.errors.join(', ')}`);
          }
        } catch (error) {
          errors.push(`[${index}]: Validation error - ${error.message}`);
        }
      }

      if (errors.length > 0) {
        return new ValidationResult(false, [
          this._formatError(`${message}: ${errors.join('; ')}`)
        ]);
      }

      return new ValidationResult(true);
    });
    return this;
  }

  // Validate nested objects
  object(schema, message = 'Invalid object structure') {
    this.rules.push(() => {
      if (this._shouldSkipOptional(false)) {
        return new ValidationResult(true);
      }

      if (
        typeof this.value !== 'object' ||
        this.value === null ||
        Array.isArray(this.value)
      ) {
        return new ValidationResult(false, [this._formatError(message)]);
      }

      try {
        const result = validate(schema, this.value);

        if (!result.isValid) {
          const fieldErrors = result.getErrors();
          const errorMessages = Object.entries(fieldErrors)
            .map(([field, errs]) => `${field}: ${errs.join(', ')}`)
            .join('; ');

          return new ValidationResult(false, [
            this._formatError(`Object validation failed - ${errorMessages}`)
          ]);
        }

        return new ValidationResult(true);
      } catch (error) {
        return new ValidationResult(false, [
          this._formatError(`Object validation error: ${error.message}`)
        ]);
      }
    });
    return this;
  }

  // Async nested object validation
  objectAsync(schema, message = 'Invalid object structure') {
    this.asyncRules.push(async () => {
      if (this._shouldSkipOptional(false)) {
        return new ValidationResult(true);
      }

      if (
        typeof this.value !== 'object' ||
        this.value === null ||
        Array.isArray(this.value)
      ) {
        return new ValidationResult(false, [this._formatError(message)]);
      }

      try {
        const result = await validateAsync(schema, this.value);

        if (!result.isValid) {
          const fieldErrors = result.getErrors();
          const errorMessages = Object.entries(fieldErrors)
            .map(([field, errs]) => `${field}: ${errs.join(', ')}`)
            .join('; ');

          return new ValidationResult(false, [
            this._formatError(`Object validation failed - ${errorMessages}`)
          ]);
        }

        return new ValidationResult(true);
      } catch (error) {
        return new ValidationResult(false, [
          this._formatError(`Object validation error: ${error.message}`)
        ]);
      }
    });
    return this;
  }

  pattern(regex, message = 'Invalid format') {
    if (!isRegexSafe(regex)) {
      throw new Error(
        'Potentially unsafe regex pattern detected. Please use a simple pattern.'
      );
    }

    this.rules.push(() => {
      if (this._shouldSkipOptional()) {
        return new ValidationResult(true);
      }

      if (this.value != null && this.value !== '') {
        const stringValue = String(this.value);

        try {
          if (!safeRegexTestSync(regex, stringValue)) {
            return new ValidationResult(false, [this._formatError(message)]);
          }
        } catch (error) {
          if (error.message.includes('Input too long')) {
            return new ValidationResult(false, [
              this._formatError('Input too long for pattern validation')
            ]);
          }
          return new ValidationResult(false, [
            this._formatError('Pattern validation failed')
          ]);
        }
      }
      return new ValidationResult(true);
    });
    return this;
  }

  patternAsync(regex, message = 'Invalid format') {
    if (!isRegexSafe(regex)) {
      throw new Error(
        'Potentially unsafe regex pattern detected. Please use a simple pattern.'
      );
    }

    this.asyncRules.push(async () => {
      if (this._shouldSkipOptional()) {
        return new ValidationResult(true);
      }

      if (this.value != null && this.value !== '') {
        const stringValue = String(this.value);

        if (stringValue.length > 10000) {
          return new ValidationResult(false, [
            this._formatError('Input too long for pattern validation')
          ]);
        }

        try {
          const result = await safeRegexTest(
            regex,
            stringValue,
            this.regexTimeout
          );
          if (!result) {
            return new ValidationResult(false, [this._formatError(message)]);
          }
        } catch (error) {
          if (error.message.includes('timeout')) {
            return new ValidationResult(false, [
              this._formatError(
                'Pattern validation timeout - pattern too complex'
              )
            ]);
          }
          return new ValidationResult(false, [
            this._formatError('Pattern validation failed')
          ]);
        }
      }
      return new ValidationResult(true);
    });
    return this;
  }

  when(condition, validator) {
    this.rules.push(() => {
      const shouldValidate =
        typeof condition === 'function' ? condition(this.value) : condition;

      if (shouldValidate) {
        if (typeof validator === 'function') {
          const conditionalValidator = validator(this.value);
          return conditionalValidator.validate();
        } else {
          return validator.validate();
        }
      }

      return new ValidationResult(true);
    });
    return this;
  }

  custom(validatorFn, message = 'Custom validation failed') {
    this.rules.push(() => {
      if (this._shouldSkipOptional()) {
        return new ValidationResult(true);
      }

      try {
        const result = validatorFn(this.value);

        if (typeof result === 'boolean') {
          return result
            ? new ValidationResult(true)
            : new ValidationResult(false, [this._formatError(message)]);
        }

        if (result && typeof result === 'object' && 'isValid' in result) {
          return result;
        }

        if (typeof result === 'string') {
          return new ValidationResult(false, [this._formatError(result)]);
        }

        return new ValidationResult(true);
      } catch (error) {
        return new ValidationResult(false, [
          this._formatError(`Custom validation error: ${error.message}`)
        ]);
      }
    });
    return this;
  }

  customAsync(validatorFn, message = 'Async validation failed') {
    this.asyncRules.push(async () => {
      if (this._shouldSkipOptional()) {
        return new ValidationResult(true);
      }

      try {
        const result = await validatorFn(this.value);

        if (typeof result === 'boolean') {
          return result
            ? new ValidationResult(true)
            : new ValidationResult(false, [this._formatError(message)]);
        }

        if (result && typeof result === 'object' && 'isValid' in result) {
          return result;
        }

        if (typeof result === 'string') {
          return new ValidationResult(false, [this._formatError(result)]);
        }

        return new ValidationResult(true);
      } catch (error) {
        return new ValidationResult(false, [
          this._formatError(`Async validation error: ${error.message}`)
        ]);
      }
    });
    return this;
  }

  validate() {
    const result = new ValidationResult(true);

    for (const rule of this.rules) {
      try {
        const ruleResult = rule();
        if (!ruleResult.isValid) {
          result.isValid = false;
          result.errors.push(...ruleResult.errors);
        }
      } catch (error) {
        result.isValid = false;
        result.errors.push(
          this._formatError(`Validation error: ${error.message}`)
        );
      }
    }

    return result;
  }

  async validateAsync() {
    const syncResult = this.validate();

    if (!syncResult.isValid) {
      return syncResult;
    }

    const result = new ValidationResult(true, [...syncResult.errors]);

    for (const asyncRule of this.asyncRules) {
      try {
        const ruleResult = await asyncRule();
        if (!ruleResult.isValid) {
          result.isValid = false;
          result.errors.push(...ruleResult.errors);
        }
      } catch (error) {
        result.isValid = false;
        result.errors.push(
          this._formatError(`Async validation error: ${error.message}`)
        );
      }
    }

    return result;
  }
}

module.exports = { BaseValidator };
