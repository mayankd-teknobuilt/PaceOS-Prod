const fs = require('fs');
const path = require('path');
const { MODULE_REGISTRY, getModuleEnvScopeTag } = require('../testdata/stageModules.registry');
const { toSlug, toClassName } = require('../utils/moduleSlug');

const pagesDir = path.resolve(__dirname, '..', 'pages', 'modules');
const specsDir = path.resolve(__dirname, '..', 'tests', 'prod-modules', 'All Modules');

const CUSTOMIZED_MODULE_SLUGS = new Set(['digital-control-tower']);

function escapeJsString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function buildPageFile(module) {
  const slug = toSlug(module.moduleName);
  const className = `${toClassName(slug)}Page`;

  return `const ModuleBasePage = require('./ModuleBasePage');

class ${className} extends ModuleBasePage {
  constructor(page) {
    super(page, '${escapeJsString(module.moduleName)}');
  }
}

module.exports = ${className};
`;
}

function buildSpecFile(module) {
  const slug = toSlug(module.moduleName);
  const className = `${toClassName(slug)}Page`;
  const safeName = escapeJsString(module.moduleName);

  const scopeTag = getModuleEnvScopeTag(module.moduleName);

  return `const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const ${className} = require('../../../pages/modules/${slug}');

test.describe('${scopeTag} @prod-modules ${module.moduleName}', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('${safeName}'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new ${className}(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
`;
}

function removeOrphanSpecs(validSlugs) {
  if (!fs.existsSync(specsDir)) return 0;

  let removed = 0;
  for (const file of fs.readdirSync(specsDir)) {
    if (!file.endsWith('.spec.js')) continue;
    const slug = file.replace(/\.spec\.js$/, '');
    if (!validSlugs.has(slug)) {
      fs.unlinkSync(path.join(specsDir, file));
      removed++;
    }
  }
  return removed;
}

if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });
if (!fs.existsSync(specsDir)) fs.mkdirSync(specsDir, { recursive: true });

const generatedModules = [];
const validSlugs = new Set(MODULE_REGISTRY.map(module => toSlug(module.moduleName)));

for (const module of MODULE_REGISTRY) {
  const slug = toSlug(module.moduleName);
  const className = `${toClassName(slug)}Page`;

  if (CUSTOMIZED_MODULE_SLUGS.has(slug)) {
    fs.writeFileSync(path.join(specsDir, `${slug}.spec.js`), buildSpecFile(module), 'utf8');
    generatedModules.push({ slug, className, skipped: true });
    continue;
  }

  fs.writeFileSync(path.join(pagesDir, `${slug}.js`), buildPageFile(module), 'utf8');
  fs.writeFileSync(path.join(specsDir, `${slug}.spec.js`), buildSpecFile(module), 'utf8');
  generatedModules.push({ slug, className });
}

const removedSpecs = removeOrphanSpecs(validSlugs);
console.log(
  `Generated ${generatedModules.length} module page/spec pairs (${removedSpecs} orphan specs removed).`
);
