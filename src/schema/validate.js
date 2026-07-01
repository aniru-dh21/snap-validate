/**
 * Snap Validate - Schema validation entry points
 */

const { ValidationResult } = require('../core/ValidationResult');
const { assertSchemaAndData, buildResponse } = require('./runner');

// Main validation function
const validate = (schema, data) => {
  assertSchemaAndData(schema, data);

  const results = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(schema)) {
    try {
      const fieldValue = data[field];
      const validatorInstance =
        typeof validator === 'function' ? validator(fieldValue) : validator;

      // Set field name for better error context
      validatorInstance.setFieldName(field);

      const result = validatorInstance.validate();

      results[field] = result;
      if (!result.isValid) {
        isValid = false;
      }
    } catch (error) {
      results[field] = new ValidationResult(false, [
        `${field}: Validation setup error - ${error.message}`
      ]);
      isValid = false;
    }
  }

  return buildResponse(results, isValid);
};

// Async validation function
const validateAsync = async (schema, data) => {
  assertSchemaAndData(schema, data);

  const results = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(schema)) {
    try {
      const fieldValue = data[field];

      const validatorInstance =
        typeof validator === 'function' ? validator(fieldValue) : validator;

      // Set field name for better error context
      validatorInstance.setFieldName(field);

      const result =
        validatorInstance.asyncRules && validatorInstance.asyncRules.length > 0
          ? await validatorInstance.validateAsync()
          : validatorInstance.validate();

      results[field] = result;
      if (!result.isValid) {
        isValid = false;
      }
    } catch (error) {
      results[field] = new ValidationResult(false, [
        `${field}: Validation setup error - ${error.message}`
      ]);
      isValid = false;
    }
  }

  return buildResponse(results, isValid);
};

module.exports = { validate, validateAsync };
