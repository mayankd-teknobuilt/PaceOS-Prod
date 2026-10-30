const { getTestCredentials } = require('../utils/envSecrets');

function getValidUser() {
  return getTestCredentials();
}

module.exports = {
  get validUser() {
    return getValidUser();
  },
  getValidUser
};
