const { BaseValidator } = require('../core/BaseValidator');

const url = (value) => {
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return new BaseValidator(value)
    .required('URL is required')
    .pattern(urlRegex, 'Invalid URL format');
};

module.exports = { url };
