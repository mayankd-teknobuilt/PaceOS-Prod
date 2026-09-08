const { trendViews } = require('./shared');

module.exports = {
  slug: 'execution-overview',
  name: 'Execution Overview',
  setupMode: 'filters',
  prepareTrendViews: trendViews,
  entry: [{ type: 'tab', label: 'Execution Overview' }],
  steps: [
    { type: 'report', name: 'Area/Discipline based Summary', option: 'Area/Discipline based Summary' },
    { type: 'report', name: 'Detailed Breakdown', option: 'Detailed Breakdown' },
    { type: 'report', name: 'Readiness Issues', option: 'Readiness Issues' },
    { type: 'report', name: 'Release Execution Status', option: 'Release Execution Status' },
    {
      type: 'report',
      name: 'Planned vs. Actual Earned Man-Hours',
      option: 'Planned vs. Actual Earned Man-Hours'
    },
    { type: 'report', name: 'IWP Stage Overview', option: 'IWP Stage Overview' },
    { type: 'report', name: 'Daily Progress Intelligence', option: 'Daily Progress Intelligence' },
    { type: 'report', name: 'Delay/Hindrances Matrix', option: 'Delay/Hindrances Matrix' },
    { type: 'report', name: 'Daily Progress Not Submitted', option: 'Daily Progress Not Submitted' },
    { type: 'report', name: 'PMID-wise Progress', option: 'PMID-wise Progress' },
    { type: 'report', name: 'Compiled vs. Not Compiled IWPs', option: 'Compiled vs. Not Compiled IWPs' },
    { type: 'button', name: 'CWP filter', label: 'CWP' },
    { type: 'report', name: 'Execution Management Summary', option: 'Execution Management Summary' },
    { type: 'report', name: 'Preparation Management Summary', option: 'Preparation Management Summary' },
    { type: 'report', name: 'Execution Leadership Summary', option: 'Execution Leadership Summary' },
    { type: 'report', name: 'Preparation Leadership Risks', option: 'Preparation Leadership Risks' },
    { type: 'report', name: 'Execution Team Lead Summary', option: 'Execution Team Lead Summary' },
    { type: 'report', name: 'Preparation Team Lead Summary', option: 'Preparation Team Lead Summary' },
    { type: 'report', name: 'Management Weekly Progress', option: 'Management Weekly Progress' },
    { type: 'report', name: 'Document Readiness Lookahead', option: 'Document Readiness Lookahead' }
  ]
};
