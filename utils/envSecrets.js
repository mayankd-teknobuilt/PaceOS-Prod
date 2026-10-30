/**
 * Load secrets from .env files without dotenv variable expansion mangling special characters.
 */
function loadEnvFileRaw(filePath, fs, dotenv) {
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = dotenv.parse(content);
  for (const [key, value] of Object.entries(parsed)) {
    process.env[key] = value;
  }
}

function trimEnvValue(value) {
  if (value === undefined || value === null) return '';
  let v = String(value).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  return v;
}

function getTestCredentials() {
  return {
    email: trimEnvValue(process.env.TEST_EMAIL),
    password: trimEnvValue(process.env.TEST_PASSWORD)
  };
}

module.exports = {
  loadEnvFileRaw,
  trimEnvValue,
  getTestCredentials
};
