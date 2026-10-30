/**
 * Dashboard module registry API (prod + dev3 aware).
 */
const { getPaceEnvKey } = require('../utils/paceEnv');
const {
  MODULE_REGISTRY,
  resolveModuleMeta,
  isModuleEnabledForEnv,
  getRegistryEntry,
  getModulesForEnv,
  getModuleEnvScopeTag
} = require('./stageModules.registry');

const MODULE_ALIASES = {
  Audits: 'Audits / Compliance'
};

const TABS = {
  ON_SITE_CONSTRUCTION_EXECUTION: 'On-Site Construction Execution',
  HEALTH_SAFETY_ENVIRONMENT: 'Health, Safety & Environment',
  DIGITAL_CONTROL_TOWER: 'Digital Control Tower',
  PACE_ADMINISTRATION: 'PACE Administration'
};

function getByName(moduleName) {
  const resolvedName = MODULE_ALIASES[moduleName] || moduleName;
  const row = getRegistryEntry(resolvedName);
  if (!isModuleEnabledForEnv(resolvedName)) {
    throw new Error(`Module "${resolvedName}" is not enabled for PACE_ENV=${getPaceEnvKey()}.`);
  }
  return resolveModuleMeta(row);
}

function byTab(tabName) {
  return getModulesForEnv().filter(module => module.tabName === tabName);
}

const modules = getModulesForEnv();

module.exports = {
  TABS,
  MODULE_REGISTRY,
  modules,
  getByName,
  byTab,
  isModuleEnabledForEnv,
  getModulesForEnv,
  getModuleEnvScopeTag,
  resolveModuleMeta
};
