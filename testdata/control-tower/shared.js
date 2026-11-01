const { projectData } = require('../TestData');

const DEFAULT_PORTFOLIO_URL = 'https://us-controltower.pace-os.com/#/portfolio?page=1';

function getPortfolioUrl() {
  return process.env.CONTROL_TOWER_PORTFOLIO_URL?.trim() || DEFAULT_PORTFOLIO_URL;
}

function getControlTowerUrlPattern() {
  const source = process.env.CONTROL_TOWER_URL_PATTERN?.trim();
  if (source) {
    return new RegExp(source, 'i');
  }
  return /controltower\.pace-os\.com/i;
}

/** @deprecated use getPortfolioUrl() — resolved at call time for PACE_ENV profiles */
const portfolioUrl = getPortfolioUrl();

/** @deprecated use getControlTowerUrlPattern() */
const CONTROL_TOWER_URL = getControlTowerUrlPattern();
const projectName = projectData.projectName;

const trendViews = ['Utilization Trend', 'Daily Progress User Matrix'];

function getControlTowerDiscoveryTabs(envKey = process.env.PACE_ENV || 'prod') {
  const key = String(envKey).trim().toLowerCase();
  if (key === 'dev3') {
    return [
      'Project Libraries',
      'Standard Libraries',
      'PMS',
      'Leading Indicators',
      'Lagging Indicators'
    ];
  }
  return ['Project Progress', 'Execution Overview', 'Health And Safety', 'JIM'];
}

module.exports = {
  getPortfolioUrl,
  getControlTowerUrlPattern,
  portfolioUrl,
  CONTROL_TOWER_URL,
  getControlTowerDiscoveryTabs,
  projectName,
  trendViews
};
