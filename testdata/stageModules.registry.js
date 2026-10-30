/**
 * Merged prod + dev3 dashboard modules (from discover-stage-modules).
 * Regenerate: npm run merge:module-registries (after discover on prod and dev3).
 */
const { getPaceEnvKey } = require('../utils/paceEnv');

function entry(partial) {
  return {
    enabledEnvs: ['prod'],
    envOverrides: {},
    ...partial
  };
}

/** @type {Array<import('./stageModules.types').ModuleRegistryEntry>} */
const MODULE_REGISTRY = [
  // --- prod only (Golden Pass dashboard) ---
  entry({ moduleName: 'Pre-Start', tabIndex: 0, tabName: 'On-Site Construction Execution', moduleIndex: 0, enabledEnvs: ['prod'] }),
  entry({ moduleName: 'My Project Network', tabIndex: 0, tabName: 'On-Site Construction Execution', moduleIndex: 1, enabledEnvs: ['prod'] }),
  entry({ moduleName: 'Isometric Progress', tabIndex: 0, tabName: 'On-Site Construction Execution', moduleIndex: 2, enabledEnvs: ['prod'] }),
  entry({ moduleName: 'Onsite Work Execution', tabIndex: 0, tabName: 'On-Site Construction Execution', moduleIndex: 3, enabledEnvs: ['prod'] }),
  entry({ moduleName: 'Joint Integrity Management', tabIndex: 0, tabName: 'On-Site Construction Execution', moduleIndex: 5, enabledEnvs: ['prod'] }),
  entry({ moduleName: 'Heat Trace', tabIndex: 0, tabName: 'On-Site Construction Execution', moduleIndex: 6, enabledEnvs: ['prod'] }),
  entry({ moduleName: 'Project Information Hub', tabIndex: 1, tabName: 'Health, Safety & Environment', moduleIndex: 0, enabledEnvs: ['prod'] }),
  entry({ moduleName: 'Audits / Compliance', tabIndex: 1, tabName: 'Health, Safety & Environment', moduleIndex: 1, enabledEnvs: ['prod'] }),
  entry({ moduleName: 'Observation and Intervention', tabIndex: 1, tabName: 'Health, Safety & Environment', moduleIndex: 2, enabledEnvs: ['prod'] }),
  entry({ moduleName: 'Geoplot Radar', tabIndex: 2, tabName: 'Digital Control Tower', moduleIndex: 0, enabledEnvs: ['prod'] }),
  entry({ moduleName: 'HSE Plus Control Tower', tabIndex: 2, tabName: 'Digital Control Tower', moduleIndex: 3, enabledEnvs: ['prod'] }),
  entry({ moduleName: 'McDermott PowerBI', tabIndex: 2, tabName: 'Digital Control Tower', moduleIndex: 4, enabledEnvs: ['prod'] }),

  // --- both environments (same module name; tab/index differ on dev3) ---
  entry({
    moduleName: 'Equipment Management',
    tabIndex: 0,
    tabName: 'On-Site Construction Execution',
    moduleIndex: 4,
    enabledEnvs: ['prod', 'dev3'],
    envOverrides: {
      dev3: { tabIndex: 2, tabName: 'On-Site Construction & Services', moduleIndex: 2 }
    }
  }),
  entry({
    moduleName: 'Digital Control Tower',
    tabIndex: 2,
    tabName: 'Digital Control Tower',
    moduleIndex: 1,
    enabledEnvs: ['prod', 'dev3'],
    envOverrides: {
      dev3: { tabIndex: 2, tabName: 'On-Site Construction & Services', moduleIndex: 0 }
    }
  }),
  entry({
    moduleName: 'Action Tracker',
    tabIndex: 2,
    tabName: 'Digital Control Tower',
    moduleIndex: 2,
    enabledEnvs: ['prod', 'dev3'],
    envOverrides: {
      dev3: { tabIndex: 0, tabName: 'Advanced Project Engineering', moduleIndex: 12 }
    }
  }),
  entry({
    moduleName: 'Projects',
    tabIndex: 3,
    tabName: 'PACE Administration',
    moduleIndex: 0,
    urlPattern: /project-list/i,
    enabledEnvs: ['prod', 'dev3']
  }),
  entry({
    moduleName: 'Users',
    tabIndex: 3,
    tabName: 'PACE Administration',
    moduleIndex: 1,
    urlPattern: /\/users/i,
    enabledEnvs: ['prod', 'dev3']
  }),
  entry({
    moduleName: 'Invite Users',
    tabIndex: 3,
    tabName: 'PACE Administration',
    moduleIndex: 2,
    urlPattern: /invite|user-invite|invitation/i,
    enabledEnvs: ['prod', 'dev3']
  }),
  entry({
    moduleName: 'Organization',
    tabIndex: 3,
    tabName: 'PACE Administration',
    moduleIndex: 3,
    enabledEnvs: ['prod', 'dev3']
  }),
  entry({
    moduleName: 'Subscriptions',
    tabIndex: 3,
    tabName: 'PACE Administration',
    moduleIndex: 4,
    urlPattern: /subscription/i,
    enabledEnvs: ['prod', 'dev3']
  }),
  entry({
    moduleName: 'Departments',
    tabIndex: 3,
    tabName: 'PACE Administration',
    moduleIndex: 5,
    enabledEnvs: ['prod', 'dev3']
  }),
  entry({
    moduleName: 'Operating-locations',
    tabIndex: 3,
    tabName: 'PACE Administration',
    moduleIndex: 6,
    enabledEnvs: ['prod', 'dev3']
  }),
  entry({
    moduleName: 'Portfolio Manager',
    tabIndex: 3,
    tabName: 'PACE Administration',
    moduleIndex: 7,
    urlPattern: /\/portfolio/i,
    enabledEnvs: ['prod', 'dev3']
  }),

  // --- dev3 only (ASP dashboard) ---
  entry({ moduleName: 'Geo Plot Manager', tabIndex: 0, tabName: 'Advanced Project Engineering', moduleIndex: 0, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Geo Plot Radar', tabIndex: 0, tabName: 'Advanced Project Engineering', moduleIndex: 1, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'APE Digital Control Tower', tabIndex: 0, tabName: 'Advanced Project Engineering', moduleIndex: 2, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Advanced Analytics', tabIndex: 0, tabName: 'Advanced Project Engineering', moduleIndex: 3, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Information Management', tabIndex: 0, tabName: 'Advanced Project Engineering', moduleIndex: 4, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Engineering Work Package', tabIndex: 0, tabName: 'Advanced Project Engineering', moduleIndex: 5, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Construction Work Package', tabIndex: 0, tabName: 'Advanced Project Engineering', moduleIndex: 6, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Installation Work Package', tabIndex: 0, tabName: 'Advanced Project Engineering', moduleIndex: 7, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Progress & Close-out', tabIndex: 0, tabName: 'Advanced Project Engineering', moduleIndex: 8, enabledEnvs: ['dev3'] }),
  entry({ moduleName: '3D View', tabIndex: 0, tabName: 'Advanced Project Engineering', moduleIndex: 9, enabledEnvs: ['dev3'] }),
  entry({ moduleName: '4D View', tabIndex: 0, tabName: 'Advanced Project Engineering', moduleIndex: 10, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Kanban Material Manager', tabIndex: 0, tabName: 'Advanced Project Engineering', moduleIndex: 11, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Activity Definition', tabIndex: 1, tabName: 'Productivity Management', moduleIndex: 0, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Activity To Crew Composition', tabIndex: 1, tabName: 'Productivity Management', moduleIndex: 1, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Owner Productivity Estimate', tabIndex: 1, tabName: 'Productivity Management', moduleIndex: 2, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Contractor Activity Definition', tabIndex: 1, tabName: 'Productivity Management', moduleIndex: 3, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Contractor Activity To Crew Composition', tabIndex: 1, tabName: 'Productivity Management', moduleIndex: 4, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Contractor Productivity Estimates', tabIndex: 1, tabName: 'Productivity Management', moduleIndex: 5, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Services Management', tabIndex: 2, tabName: 'On-Site Construction & Services', moduleIndex: 1, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Master Asset Management', tabIndex: 2, tabName: 'On-Site Construction & Services', moduleIndex: 3, enabledEnvs: ['dev3'] }),
  entry({ moduleName: 'Permit Management', tabIndex: 2, tabName: 'On-Site Construction & Services', moduleIndex: 4, enabledEnvs: ['dev3'] })
];

function resolveModuleMeta(entryRow, envKey = getPaceEnvKey()) {
  const override = entryRow.envOverrides?.[envKey] || {};
  return {
    moduleName: entryRow.moduleName,
    tabIndex: override.tabIndex ?? entryRow.tabIndex,
    tabName: override.tabName ?? entryRow.tabName,
    moduleIndex: override.moduleIndex ?? entryRow.moduleIndex,
    urlPattern: override.urlPattern ?? entryRow.urlPattern,
    enabledEnvs: entryRow.enabledEnvs
  };
}

function getModuleEnvScopeTag(moduleName) {
  const row = MODULE_REGISTRY.find(m => m.moduleName === moduleName);
  if (!row) {
    return '@pace-env-prod';
  }
  const envs = row.enabledEnvs;
  const hasProd = envs.includes('prod');
  const hasDev3 = envs.includes('dev3');
  if (hasProd && hasDev3) {
    return '@pace-env-all';
  }
  if (hasDev3) {
    return '@pace-env-dev3';
  }
  return '@pace-env-prod';
}

function isModuleEnabledForEnv(moduleName, envKey = getPaceEnvKey()) {
  const row = MODULE_REGISTRY.find(m => m.moduleName === moduleName);
  if (!row) return false;
  return row.enabledEnvs.includes(envKey);
}

function getRegistryEntry(moduleName) {
  const row = MODULE_REGISTRY.find(m => m.moduleName === moduleName);
  if (!row) {
    throw new Error(`Unknown module: "${moduleName}". Update testdata/stageModules.registry.js`);
  }
  return row;
}

function getModulesForEnv(envKey = getPaceEnvKey()) {
  return MODULE_REGISTRY.filter(row => row.enabledEnvs.includes(envKey)).map(row =>
    resolveModuleMeta(row, envKey)
  );
}

module.exports = {
  MODULE_REGISTRY,
  resolveModuleMeta,
  isModuleEnabledForEnv,
  getModuleEnvScopeTag,
  getRegistryEntry,
  getModulesForEnv
};
