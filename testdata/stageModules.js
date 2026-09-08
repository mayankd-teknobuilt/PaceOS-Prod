/**
 * Production dashboard module registry — single source of truth for names/tabs.
 * Re-discover with: npm run discover:prod-modules
 * Regenerate pages/specs with: npm run generate:prod-modules
 */

const TABS = {
  ON_SITE_CONSTRUCTION_EXECUTION: 'On-Site Construction Execution',
  HEALTH_SAFETY_ENVIRONMENT: 'Health, Safety & Environment',
  DIGITAL_CONTROL_TOWER: 'Digital Control Tower',
  PACE_ADMINISTRATION: 'PACE Administration'
};

const modules = [
  { tabIndex: 0, tabName: TABS.ON_SITE_CONSTRUCTION_EXECUTION, moduleIndex: 0, moduleName: 'Pre-Start' },
  { tabIndex: 0, tabName: TABS.ON_SITE_CONSTRUCTION_EXECUTION, moduleIndex: 1, moduleName: 'My Project Network' },
  { tabIndex: 0, tabName: TABS.ON_SITE_CONSTRUCTION_EXECUTION, moduleIndex: 2, moduleName: 'Isometric Progress' },
  { tabIndex: 0, tabName: TABS.ON_SITE_CONSTRUCTION_EXECUTION, moduleIndex: 3, moduleName: 'Onsite Work Execution' },
  { tabIndex: 0, tabName: TABS.ON_SITE_CONSTRUCTION_EXECUTION, moduleIndex: 4, moduleName: 'Equipment Management' },
  { tabIndex: 0, tabName: TABS.ON_SITE_CONSTRUCTION_EXECUTION, moduleIndex: 5, moduleName: 'Joint Integrity Management' },
  { tabIndex: 0, tabName: TABS.ON_SITE_CONSTRUCTION_EXECUTION, moduleIndex: 6, moduleName: 'Heat Trace' },
  { tabIndex: 1, tabName: TABS.HEALTH_SAFETY_ENVIRONMENT, moduleIndex: 0, moduleName: 'Project Information Hub' },
  { tabIndex: 1, tabName: TABS.HEALTH_SAFETY_ENVIRONMENT, moduleIndex: 1, moduleName: 'Audits' },
  { tabIndex: 1, tabName: TABS.HEALTH_SAFETY_ENVIRONMENT, moduleIndex: 2, moduleName: 'Observation and Intervention' },
  { tabIndex: 2, tabName: TABS.DIGITAL_CONTROL_TOWER, moduleIndex: 0, moduleName: 'Geoplot Radar' },
  { tabIndex: 2, tabName: TABS.DIGITAL_CONTROL_TOWER, moduleIndex: 1, moduleName: 'Digital Control Tower' },
  { tabIndex: 2, tabName: TABS.DIGITAL_CONTROL_TOWER, moduleIndex: 2, moduleName: 'Action Tracker' },
  { tabIndex: 2, tabName: TABS.DIGITAL_CONTROL_TOWER, moduleIndex: 3, moduleName: 'HSE Plus Control Tower' },
  { tabIndex: 3, tabName: TABS.PACE_ADMINISTRATION, moduleIndex: 0, moduleName: 'Projects' },
  { tabIndex: 3, tabName: TABS.PACE_ADMINISTRATION, moduleIndex: 1, moduleName: 'Users' },
  { tabIndex: 3, tabName: TABS.PACE_ADMINISTRATION, moduleIndex: 2, moduleName: 'Invite Users' },
  { tabIndex: 3, tabName: TABS.PACE_ADMINISTRATION, moduleIndex: 3, moduleName: 'Organization' },
  { tabIndex: 3, tabName: TABS.PACE_ADMINISTRATION, moduleIndex: 4, moduleName: 'Subscriptions' },
  { tabIndex: 3, tabName: TABS.PACE_ADMINISTRATION, moduleIndex: 5, moduleName: 'Departments' },
  { tabIndex: 3, tabName: TABS.PACE_ADMINISTRATION, moduleIndex: 6, moduleName: 'Operating-locations' },
  { tabIndex: 3, tabName: TABS.PACE_ADMINISTRATION, moduleIndex: 7, moduleName: 'Portfolio Manager' }
];

function getByName(moduleName) {
  const meta = modules.find(module => module.moduleName === moduleName);
  if (!meta) {
    throw new Error(`Unknown production module: "${moduleName}". Update testdata/stageModules.js.`);
  }
  return { ...meta };
}

function byTab(tabName) {
  return modules.filter(module => module.tabName === tabName).map(module => ({ ...module }));
}

module.exports = {
  TABS,
  modules,
  getByName,
  byTab,
  onSiteModules: () => byTab(TABS.ON_SITE_CONSTRUCTION_EXECUTION),
  hseModules: () => byTab(TABS.HEALTH_SAFETY_ENVIRONMENT),
  controlTowerModules: () => byTab(TABS.DIGITAL_CONTROL_TOWER),
  administrationModules: () => byTab(TABS.PACE_ADMINISTRATION)
};
