const { getByName, isModuleEnabledForEnv } = require('../testdata/stageModules');

function getControlTowerModuleName() {
  return process.env.PROD_CONTROL_TOWER_MODULE?.trim() || 'Digital Control Tower';
}

function getControlTowerDashboardMeta() {
  const moduleName = getControlTowerModuleName();
  if (!isModuleEnabledForEnv(moduleName)) {
    throw new Error(
      `Control Tower module "${moduleName}" is not enabled for PACE_ENV=${process.env.PACE_ENV || 'prod'}.`
    );
  }
  const meta = getByName(moduleName);
  const tabName = process.env.PROD_CONTROL_TOWER_TAB?.trim() || meta.tabName;
  return { ...meta, tabName, moduleName: meta.moduleName };
}

module.exports = {
  getControlTowerModuleName,
  getControlTowerDashboardMeta
};
