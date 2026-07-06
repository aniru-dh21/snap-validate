/**
 * Snap Validate - ESM entry point.
 *
 * A thin wrapper over the single CommonJS implementation (zero build step).
 * Both module systems share the same class objects, so `instanceof
 * BaseValidator` works across CJS and ESM consumers (no dual-package hazard).
 */
import cjs from '../src/index.js';

export const {
  BaseValidator,
  ValidationResult,
  validators,
  validate,
  validateAsync,
  toStandardSchema,
  safeRegexTest,
  safeRegexTestSync,
  isRegexSafe
} = cjs;

export default cjs;
