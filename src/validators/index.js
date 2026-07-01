const { email } = require('./email');
const { phone } = require('./phone');
const { creditCard } = require('./creditcard');
const { url } = require('./url');
const { password } = require('./password');
const { alphanumeric } = require('./alphanumeric');
const { numeric } = require('./numeric');
const { zipCode } = require('./zipcode');

module.exports = {
  email,
  phone,
  creditCard,
  url,
  password,
  alphanumeric,
  numeric,
  zipCode
};
