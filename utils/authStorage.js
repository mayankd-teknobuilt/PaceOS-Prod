const fs = require('fs');
const path = require('path');

const AUTH_DIR = path.resolve(__dirname, '..', '.auth');

function getSharedAuthStoragePath(loginMethod = 'credentials') {
  const fileName = loginMethod === 'badge' ? 'badge.json' : 'credentials.json';
  return path.join(AUTH_DIR, fileName);
}

function getAuthStoragePath(loginMethod = 'credentials', workerIndex = null) {
  if (workerIndex === null || workerIndex === undefined) {
    return getSharedAuthStoragePath(loginMethod);
  }

  const base = loginMethod === 'badge' ? 'badge' : 'credentials';
  return path.join(AUTH_DIR, `${base}-worker-${workerIndex}.json`);
}

function ensureWorkerAuthStorage(loginMethod, workerIndex) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const workerPath = getAuthStoragePath(loginMethod, workerIndex);
  const seedPath = getSharedAuthStoragePath(loginMethod);

  if (!fs.existsSync(workerPath) && fs.existsSync(seedPath)) {
    fs.copyFileSync(seedPath, workerPath);
  }

  return workerPath;
}

function authStorageExists(loginMethod = 'credentials', workerIndex = null) {
  if (workerIndex !== null && workerIndex !== undefined) {
    return (
      fs.existsSync(getAuthStoragePath(loginMethod, workerIndex)) ||
      fs.existsSync(getSharedAuthStoragePath(loginMethod))
    );
  }

  return fs.existsSync(getSharedAuthStoragePath(loginMethod));
}

module.exports = {
  AUTH_DIR,
  getAuthStoragePath,
  getSharedAuthStoragePath,
  ensureWorkerAuthStorage,
  authStorageExists
};
