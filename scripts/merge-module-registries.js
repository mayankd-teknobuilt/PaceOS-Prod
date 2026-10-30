const fs = require('fs');
const path = require('path');

function extractJsonArray(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end < start) throw new Error(`No JSON array in ${filePath}`);
  return JSON.parse(text.slice(start, end + 1));
}

function normalizeName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function main() {
  const baseDir = path.resolve(__dirname, '..');
  const prodPath = path.join(baseDir, 'testdata', 'discovered-prod-modules.json');
  const dev3Path = path.join(baseDir, 'testdata', 'discovered-dev3-modules.json');

  if (!fs.existsSync(prodPath) || !fs.existsSync(dev3Path)) {
    console.error('Run discover first:');
    console.error('  npm run discover:prod-modules');
    console.error('  npm run discover:dev3-modules');
    process.exit(1);
  }

  const prod = extractJsonArray(prodPath);
  const dev3 = extractJsonArray(dev3Path);

  const prodByName = new Map(prod.map(m => [m.moduleName, m]));
  const dev3ByName = new Map(dev3.map(m => [m.moduleName, m]));

  const common = [...prodByName.keys()].filter(name => dev3ByName.has(name)).sort();
  const prodOnly = [...prodByName.keys()].filter(name => !dev3ByName.has(name)).sort();
  const dev3Only = [...dev3ByName.keys()].filter(name => !prodByName.has(name)).sort();

  console.log(`Prod modules: ${prod.length}, Dev3 modules: ${dev3.length}`);
  console.log(`Common (${common.length}):`, common.join(', ') || '(none)');
  console.log(`Prod only (${prodOnly.length}):`, prodOnly.join(', ') || '(none)');
  console.log(`Dev3 only (${dev3Only.length}):`, dev3Only.join(', ') || '(none)');

  const fuzzy = [];
  for (const p of prodOnly) {
    const pn = normalizeName(p);
    for (const d of dev3Only) {
      if (normalizeName(d) === pn) fuzzy.push({ prod: p, dev3: d });
    }
  }
  if (fuzzy.length) {
    console.log('Possible rename pairs (manual alias):', fuzzy);
  }
}

main();
