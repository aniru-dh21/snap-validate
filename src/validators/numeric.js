const { BaseValidator } = require('../core/BaseValidator');

const numeric = (value) => {
  return new BaseValidator(value)
    .required('This field is required')
    .pattern(/^\d+$/, 'Only numbers are allowed');
};

module.exports = { numeric };
