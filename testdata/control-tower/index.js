const dailyProgress = require('./daily-progress');
const projectLibraries = require('./project-libraries');
const standardLibraries = require('./standard-libraries');
const executionOverview = require('./execution-overview');
const healthAndSafety = require('./health-and-safety');
const pms = require('./pms');
const leadingIndicators = require('./leading-indicators');
const laggingIndicators = require('./lagging-indicators');
const shared = require('./shared');

module.exports = {
  ...shared,
  categories: [
    dailyProgress,
    projectLibraries,
    standardLibraries,
    executionOverview,
    healthAndSafety,
    pms,
    leadingIndicators,
    laggingIndicators
  ],
  dailyProgress,
  projectLibraries,
  standardLibraries,
  executionOverview,
  healthAndSafety,
  pms,
  leadingIndicators,
  laggingIndicators
};
