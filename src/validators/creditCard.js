const { BaseValidator } = require('../core/BaseValidator');
const { safeRegexTestSync } = require('../utils/safeRegex');

const luhnCheck = (num) => {
  let sum = 0;
  let isEven = false;

  const cleanNum = String(num).replace(/\s/g, '');

  for (let i = cleanNum.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNum[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

const creditCard = (value) => {
  return new BaseValidator(value)
    .required('Credit card number is required')
    .custom((val) => {
      // required() already handles emptiness; skip the digit/Luhn checks
      // for falsy values to avoid emitting a second error.
      if (!val) {
        return true;
      }

      const cleanValue = String(val).replace(/\s/g, '');

      if (!safeRegexTestSync(/^\d{13,19}$/, cleanValue)) {
        return 'Credit card must be 13-19 digits';
      }

      if (!luhnCheck(cleanValue)) {
        return 'Invalid credit card number';
      }

      return true;
    });
};

module.exports = { creditCard };
