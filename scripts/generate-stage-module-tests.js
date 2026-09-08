const fs = require('fs');
const path = require('path');
const { modules } = require('../testdata/stageModules');
const { toSlug, toClassName } = require('../utils/moduleSlug');

const pagesDir = path.resolve(__dirname, '..', 'pages', 'modules');
const specsDir = path.resolve(__dirname, '..', 'tests', 'prod-modules', 'All Modules');
const indexPath = path.join(pagesDir, 'index.js');

const CUSTOMIZED_MODULE_SLUGS = new Set(['digital-control-tower']);

function buildPageFile(module) {
  const slug = toSlug(module.moduleName);
  const className = `${toClassName(slug)}Page`;

  return `const ModuleBasePage = require('./ModuleBasePage');

class ${className} extends ModuleBasePage {
  constructor(page) {
    super(page, '${module.moduleName}');
  }
}

module.exports = ${className};
`;
}

function buildSpecFile(module) {
  const slug = toSlug(module.moduleName);
  const className = `${toClassName(slug)}Page`;

  return `const { test } = require('../../../utils/prodModuleFixture');
const ${className} = require('../../../pages/modules/${slug}');

test.describe('@prod-modules ${module.moduleName}', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new ${className}(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
`;
}

if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });
if (!fs.existsSync(specsDir)) fs.mkdirSync(specsDir, { recursive: true });

const generatedModules = [];

for (const module of modules) {
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

const indexLines = modules.map(module => {
  const slug = toSlug(module.moduleName);
  const className = `${toClassName(slug)}Page`;
  const exportName = className.replace(/Page$/, '');
  return `module.exports.${exportName} = require('./${slug}');`;
});

fs.writeFileSync(indexPath, `${indexLines.join('\n')}\n`, 'utf8');
console.log(`Generated ${generatedModules.filter(m => !m.skipped).length} module pages/specs (${CUSTOMIZED_MODULE_SLUGS.size} customized preserved).`);
