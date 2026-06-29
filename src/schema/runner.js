/**
 * Snap Validate - Shared schema-runner helpers
 * Extracted from the duplicated bodies of validate / validateAsync.
 */

function assertSchemaAndData(schema, data) {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema must be a valid object');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Data must be a valid object');
  }
}

function buildResponse(results, isValid) {
  return {
    isValid,
    errors: results,
    getErrors: () => {
      const errors = {};
      for (const [field, result] of Object.entries(results)) {
        if (!result.isValid) {
          errors[field] = result.errors;
        }
      }
      return errors;
    }
  };
}

module.exports = { assertSchemaAndData, buildResponse };
