/**
 * Snap Validate - Standard Schema (v1) support
 *
 * Implements https://standardschema.dev — a tiny common interface that lets
 * frameworks (tRPC, TanStack Form, Hono, and others) consume validators from
 * any compliant library via a single `~standard` property.
 *
 * Two ways to get a standard schema from snap-validate:
 *
 * 1. `toStandardSchema(factory)` — wrap a validator factory
 *      const emailSchema = toStandardSchema((v) => validators.email(v));
 *    A fresh validator is created per validate() call, so the resulting
 *    schema is reusable and safe under concurrent async validation.
 *
 * 2. `toStandardSchema(schemaObject)` — wrap a whole snap-validate schema
 *      const userSchema = toStandardSchema({
 *        email: validators.email,
 *        age: (v) => new BaseValidator(v).between(18, 99)
 *      });
 *    Validates plain objects; issues carry a `path` of [fieldName], and the
 *    success value is a shallow copy of the input with any transform()ed
 *    field values applied.
 *
 * BaseValidator instances also expose `~standard` directly (see
 * BaseValidator.js) for consumers that duck-type on the property, with the
 * caveat that a single instance holds one value at a time.
 */

const VENDOR = 'snap-validate';

// Map a ValidationResult onto a Standard Schema result.
// `path` (optional) is prepended to every issue.
const toIssues = (validationResult, path) =>
  validationResult.errors.map((message) =>
    path ? { message, path } : { message }
  );

// Wrap a single validator factory: (value) => BaseValidator
const fromFactory = (factory) => ({
  '~standard': {
    version: 1,
    vendor: VENDOR,
    validate(value) {
      let instance;
      try {
        instance = factory(value);
      } catch (error) {
        return {
          issues: [{ message: `Validator setup error: ${error.message}` }]
        };
      }

      if (instance.asyncRules && instance.asyncRules.length > 0) {
        return instance
          .validateAsync()
          .then((result) =>
            result.isValid
              ? { value: instance.value }
              : { issues: toIssues(result) }
          );
      }

      const result = instance.validate();
      return result.isValid
        ? { value: instance.value }
        : { issues: toIssues(result) };
    }
  }
});

// Wrap a snap-validate schema object: { field: factory | BaseValidator }
const fromSchemaObject = (schema) => ({
  '~standard': {
    version: 1,
    vendor: VENDOR,
    validate(data) {
      if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        return { issues: [{ message: 'Expected an object' }] };
      }

      const entries = [];
      const issues = [];

      for (const [field, validator] of Object.entries(schema)) {
        try {
          const instance =
            typeof validator === 'function'
              ? validator(data[field])
              : validator;
          if (typeof validator !== 'function') {
            // Instance provided directly: bind the current field value.
            instance.value = data[field];
          }
          instance.setFieldName(field);
          entries.push([field, instance]);
        } catch (error) {
          issues.push({
            message: `Validation setup error - ${error.message}`,
            path: [field]
          });
        }
      }

      const finish = (results) => {
        for (const [field, instance, result] of results) {
          if (!result.isValid) {
            issues.push(...toIssues(result, [field]));
          }
          void instance;
        }
        if (issues.length > 0) {
          return { issues };
        }
        // Success: shallow copy with transformed field values applied.
        const output = { ...data };
        for (const [field, instance] of entries) {
          output[field] = instance.value;
        }
        return { value: output };
      };

      const hasAsync = entries.some(
        ([, instance]) => instance.asyncRules && instance.asyncRules.length > 0
      );

      if (!hasAsync) {
        return finish(
          entries.map(([field, instance]) => [
            field,
            instance,
            instance.validate()
          ])
        );
      }

      return Promise.all(
        entries.map(async ([field, instance]) => {
          const result =
            instance.asyncRules && instance.asyncRules.length > 0
              ? await instance.validateAsync()
              : instance.validate();
          return [field, instance, result];
        })
      ).then(finish);
    }
  }
});

/**
 * Convert a snap-validate validator factory or schema object into a
 * Standard Schema v1 (https://standardschema.dev).
 *
 * @param {Function|Object} input - A factory `(value) => BaseValidator`, or a
 *   snap-validate schema object mapping field names to factories/instances.
 * @returns {{ '~standard': object }} A reusable Standard Schema.
 */
const toStandardSchema = (input) => {
  if (typeof input === 'function') {
    return fromFactory(input);
  }
  if (input && typeof input === 'object') {
    return fromSchemaObject(input);
  }
  throw new Error(
    'toStandardSchema expects a validator factory function or a schema object'
  );
};

module.exports = { toStandardSchema, VENDOR, toIssues };
