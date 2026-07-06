/**
 * Snap Validate - Enhanced Lightweight validator library
 * @version 0.4.4 - Standard Schema Integration
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
const { toStandardSchema } = require('./standard');

module.exports = {
  BaseValidator,
  ValidationResult,
  validators,
  validate,
  validateAsync,
  toStandardSchema,
  safeRegexTest,
  safeRegexTestSync,
  isRegexSafe
};
