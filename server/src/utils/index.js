const response = require('./response');
const billNo = require('./billNo');
const date = require('./date');

module.exports = {
  ...response,
  ...billNo,
  ...date
};
