const { trendViews } = require('./shared');

module.exports = {
  slug: 'health-and-safety',
  name: 'Health And Safety',
  setupMode: 'minimal',
  prepareTrendViews: trendViews,
  entry: [{ type: 'tab', label: 'Health And Safety' }],
  steps: [{ type: 'report', name: 'Pre-Start User Matrix', option: 'Pre-Start User Matrix' }]
};
