const fs = require('fs');
const path = require('path');
const { getPaceEnvKey } = require('./paceEnv');

function getAuthDir() {
  return path.resolve(__dirname, '..', '.auth', getPaceEnvKey());
}

function getSharedAuthStoragePath(loginMethod = 'credentials') {
  const fileName = loginMethod === 'badge' ? 'badge.json' : 'credentials.json';
  return path.join(getAuthDir(), fileName);
}

function getAuthStoragePath(loginMethod = 'credentials', workerIndex = null) {
  if (workerIndex === null || workerIndex === undefined) {
    return getSharedAuthStoragePath(loginMethod);
  }

  const base = loginMethod === 'badge' ? 'badge' : 'credentials';
  return path.join(getAuthDir(), `${base}-worker-${workerIndex}.json`);
}

function ensureWorkerAuthStorage(loginMethod, workerIndex) {
  const authDir = getAuthDir();
  fs.mkdirSync(authDir, { recursive: true });

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
  getAuthDir,
  getAuthStoragePath,
  getSharedAuthStoragePath,
  ensureWorkerAuthStorage,
  authStorageExists
};
