/**
 * Snap Validate - ValidationResult
 * The result type returned by every validation rule.
 */

class ValidationResult {
  constructor(isValid, errors = []) {
    this.isValid = isValid;
    this.errors = errors;
  }

  addError(message) {
    this.errors.push(message);
    this.isValid = false;
    return this;
  }
}

module.exports = { ValidationResult };
