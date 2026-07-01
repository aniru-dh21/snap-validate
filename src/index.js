/**
 * Snap Validate - Enhanced Lightweight validator library
 * @version 0.4.3 - Security Fixes and Modularisation
 */

const { BaseValidator } = require('./core/BaseValidator');
const { ValidationResult } = require('./core/ValidationResult');
const validators = require('./validators');
const { validate, validateAsync } = require('./schema/validate');
const {
  safeRegexTest,
  safeRegexTestSync,
  isRegexSafe
} = require('./utils/safeRegex');

module.exports = {
  BaseValidator,
  ValidationResult,
  validators,
  validate,
  validateAsync,
  safeRegexTest,
  safeRegexTestSync,
  isRegexSafe
};
