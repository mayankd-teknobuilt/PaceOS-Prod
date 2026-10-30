const fs = require('fs');
const path = require('path');
const { getAuthDir } = require('./authStorage');

const LOCK_STALE_MS = 120000;

function getLockPath() {
  return path.join(getAuthDir(), 'login.lock');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function readLock() {
  try {
    return fs.readFileSync(getLockPath(), 'utf8').trim();
  } catch {
    return null;
  }
}

function clearStaleLock() {
  try {
    const lockPath = getLockPath();
    const stat = fs.statSync(lockPath);
    if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
      fs.unlinkSync(lockPath);
    }
  } catch {
    // no lock
  }
}

async function acquireLoginLock(owner, timeoutMs = 120000) {
  fs.mkdirSync(getAuthDir(), { recursive: true });
  const deadline = Date.now() + timeoutMs;
  const lockPath = getLockPath();

  while (Date.now() < deadline) {
    clearStaleLock();
    try {
      fs.writeFileSync(lockPath, `${owner}:${process.pid}:${Date.now()}`, { flag: 'wx' });
      return;
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
      await sleep(250);
    }
  }

  throw new Error(`Timed out waiting for login lock after ${timeoutMs}ms`);
}

function releaseLoginLock(owner) {
  try {
    const current = readLock();
    if (current?.startsWith(`${owner}:`)) {
      fs.unlinkSync(getLockPath());
    }
  } catch {
    // already released
  }
}

async function withLoginLock(owner, fn) {
  await acquireLoginLock(owner);
  try {
    return await fn();
  } finally {
    releaseLoginLock(owner);
  }
}

module.exports = {
  withLoginLock,
  acquireLoginLock,
  releaseLoginLock
};
