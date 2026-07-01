const { BaseValidator } = require('../core/BaseValidator');

const alphanumeric = (value) => {
  return new BaseValidator(value)
    .required('This field is required')
    .pattern(/^[a-zA-Z0-9]+$/, 'Only letters and numbers are allowed');
};

module.exports = { alphanumeric };
