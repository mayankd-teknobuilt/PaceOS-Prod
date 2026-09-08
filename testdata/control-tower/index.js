const dailyProgress = require('./daily-progress');
const projectLibraries = require('./project-libraries');
const standardLibraries = require('./standard-libraries');
const executionOverview = require('./execution-overview');
const healthAndSafety = require('./health-and-safety');
const shared = require('./shared');

module.exports = {
  ...shared,
  categories: [
    dailyProgress,
    projectLibraries,
    standardLibraries,
    executionOverview,
    healthAndSafety
  ],
  dailyProgress,
  projectLibraries,
  standardLibraries,
  executionOverview,
  healthAndSafety
};
