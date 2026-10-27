/**
 * Snap Validate - safeParse / safeParseAsync
 *
 * The ecosystem-standard result shape:
 *   { success: true,  data }
 *   { success: false, error: { issues, fieldErrors, formErrors } }
 *
 * Accepts a validator factory `(value) => BaseValidator`, a snap-validate
 * schema object, or any Standard Schema v1 (anything with `~standard`).
 */

const { toStandardSchema } = require('./standard');

// Some libraries' schemas are callable functions that carry `~standard`
// (ArkType, for example), so check functions as well as objects. Plain
// snap-validate factories never have `~standard`.
const toStandard = (schema) =>
  schema &&
  (typeof schema === 'object' || typeof schema === 'function') &&
  schema['~standard']
    ? schema
    : toStandardSchema(schema);

// Group issues for form-style display: messages keyed by top-level field,
// plus messages that belong to no field.
const buildError = (issues) => {
  const fieldErrors = {};
  const formErrors = [];

  for (const issue of issues) {
    const first = issue.path && issue.path.length > 0 ? issue.path[0] : null;
    const key =
      first !== null && typeof first === 'object' && 'key' in first
        ? first.key
        : first;

    if (key === null || key === undefined) {
      formErrors.push(issue.message);
    } else {
      const field = String(key);
      (fieldErrors[field] = fieldErrors[field] || []).push(issue.message);
    }
  }

  return { issues, fieldErrors, formErrors };
};

const toParseResult = (result) =>
  result.issues
    ? { success: false, error: buildError(result.issues) }
    : { success: true, data: result.value };

/**
 * Validate synchronously. Throws if the schema has async rules - use
 * safeParseAsync for those.
 */
const safeParse = (schema, data) => {
  const result = toStandard(schema)['~standard'].validate(data);
  if (result && typeof result.then === 'function') {
    // Avoid an unhandled rejection from the promise we are discarding.
    result.then(undefined, () => {});
    throw new Error(
      'safeParse: this schema has async rules; use safeParseAsync instead'
    );
  }
  return toParseResult(result);
};

/**
 * Validate with support for async rules. Always returns a Promise.
 */
const safeParseAsync = async (schema, data) =>
  toParseResult(await toStandard(schema)['~standard'].validate(data));

module.exports = { safeParse, safeParseAsync };
