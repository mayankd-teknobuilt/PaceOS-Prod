const fs = require('fs');
const path = require('path');

const AUTH_DIR = path.resolve(__dirname, '..', '.auth');

function getAuthStoragePath(loginMethod = 'credentials') {
  const fileName = loginMethod === 'badge' ? 'badge.json' : 'credentials.json';
  return path.join(AUTH_DIR, fileName);
}

function authStorageExists(loginMethod = 'credentials') {
  return fs.existsSync(getAuthStoragePath(loginMethod));
}

module.exports = {
  AUTH_DIR,
  getAuthStoragePath,
  authStorageExists
};
