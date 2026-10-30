const reports = [
  'Progress Measurement System',
  'IWP Progress Summary',
  'CWP Trend',
  'EWP Trend',
  'Onsite Trend',
  'Schedule Start Performance Index',
  'Schedule Closeout Adherence Rate',
  'Man-Hour Productivity Rate',
  'Action Closure Time',
  'Work Package Completion Rate',
  'Hindrance Log (Open/Closed)',
  'Daily Progress Intelligence',
  'Inspection Clearance Rate',
  'IWP Compiled vs. Not Compiled IWPs'
];

module.exports = {
  slug: 'leading-indicators',
  name: 'Leading Indicators',
  prodEnabled: false,
  enabledEnvs: ['dev3'],
  setupMode: 'minimal',
  entry: [{ type: 'tab', label: 'Leading Indicators' }],
  steps: reports.map(option => ({ type: 'report', name: option, option }))
};
