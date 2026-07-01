const { email } = require('./email');
const { phone } = require('./phone');
const { creditCard } = require('./creditCard');
const { url } = require('./url');
const { password } = require('./password');
const { alphanumeric } = require('./alphanumeric');
const { numeric } = require('./numeric');
const { zipCode } = require('./zipCode');

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
