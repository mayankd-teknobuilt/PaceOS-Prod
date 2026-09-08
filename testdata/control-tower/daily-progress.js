const { trendViews } = require('./shared');

module.exports = {
  slug: 'daily-progress',
  name: 'Daily Progress',
  entry: [{ type: 'tab', label: 'Project Progress' }],
  steps: [
    { type: 'button', name: 'Utilization Trend', label: 'Utilization Trend' },
    { type: 'button', name: 'Daily Progress User Matrix', label: 'Daily Progress User Matrix' }
  ]
};
