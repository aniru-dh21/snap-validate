const { BaseValidator } = require('../core/BaseValidator');
const { safeRegexTestSync } = require('../utils/safeRegex');

const phone = (value, format = 'us') => {
  const phoneRegex = {
    us: /^[+]?[1]?[0-9]{10}$/,
    international: /^[+][1-9][0-9]{7,14}$/,
    simple: /^[0-9]{10,15}$/
  };

  return new BaseValidator(value)
    .required('Phone number is required')
    .custom((val) => {
      const cleaned = String(val).replace(/[^+0-9]/g, '');
      const regex = phoneRegex[format] || phoneRegex.simple;

      if (!safeRegexTestSync(regex, cleaned)) {
        return 'Invalid phone number format';
      }
      return true;
    });
};

module.exports = { phone };
