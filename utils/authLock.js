const fs = require('fs');
const path = require('path');
const { AUTH_DIR } = require('./authStorage');

const LOCK_PATH = path.join(AUTH_DIR, 'login.lock');
const LOCK_STALE_MS = 120000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function readLock() {
  try {
    return fs.readFileSync(LOCK_PATH, 'utf8').trim();
  } catch {
    return null;
  }
}

function clearStaleLock() {
  try {
    const stat = fs.statSync(LOCK_PATH);
    if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
      fs.unlinkSync(LOCK_PATH);
    }
  } catch {
    // no lock
  }
}

async function acquireLoginLock(owner, timeoutMs = 120000) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    clearStaleLock();
    try {
      fs.writeFileSync(LOCK_PATH, `${owner}:${process.pid}:${Date.now()}`, { flag: 'wx' });
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
      fs.unlinkSync(LOCK_PATH);
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
