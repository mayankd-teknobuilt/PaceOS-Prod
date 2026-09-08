const { trendViews } = require('./shared');

const reports = [
  'Activity Breakdown Structure',
  'IWB-PLIP Matrix',
  'Productivity Norms',
  'Work Package To Tag Matrix',
  'PLIP Classification',
  'ITP Work Step'
];

module.exports = {
  slug: 'standard-libraries',
  name: 'Standard Libraries',
  prodEnabled: false,
  setupMode: 'minimal',
  prepareTrendViews: trendViews,
  entry: [{ type: 'tab', label: 'Standard Libraries' }],
  steps: reports.map(option => ({ type: 'report', name: option, option }))
};
