const { projectData } = require('../TestData');

const portfolioUrl =
  process.env.CONTROL_TOWER_PORTFOLIO_URL ||
  'https://us-controltower.pace-os.com/#/portfolio?page=1';

function getControlTowerUrlPattern() {
  const source = process.env.CONTROL_TOWER_URL_PATTERN?.trim();
  if (source) {
    return new RegExp(source, 'i');
  }
  return /controltower\.pace-os\.com/i;
}

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
  portfolioUrl,
  CONTROL_TOWER_URL,
  getControlTowerUrlPattern,
  getControlTowerDiscoveryTabs,
  projectName,
  trendViews
};
