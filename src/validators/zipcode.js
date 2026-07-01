const { BaseValidator } = require('../core/BaseValidator');

const zipCode = (value, country = 'us') => {
  const zipRegex = {
    us: /^\d{5}(-\d{4})?$/,
    ca: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    uk: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i
  };

  return new BaseValidator(value)
    .required('Zip code is required')
    .pattern(zipRegex[country] || zipRegex.us, 'Invalid zip code format');
};

module.exports = { zipCode };
