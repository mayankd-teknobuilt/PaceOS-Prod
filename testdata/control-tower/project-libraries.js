const { trendViews } = require('./shared');

const reports = [
  '3D Scope Matrix',
  'IWP-ITP Document Matrix',
  'CWP/IWP Tag Register',
  'GWBS',
  'CWP/EWP/IWP Register',
  'IWP Readiness Sub-System',
  'Completions Progress Sub-',
  'IWP-Tag-Document Register',
  'Progress Measurement',
  'CWP/EWP Scope Matrix',
  'ITP Inspection Register',
  'Project ITP Work Steps',
  'Master Tag Register',
  'Project Engineering Document',
  'Project L3 & L4 activity plan',
  'L4 Norms Matrix',
  'QIR NCR',
  'VTT Variance',
  'Quality Punch List',
  'TQT',
  'Jawda (Minor Quality'
];

module.exports = {
  slug: 'project-libraries',
  name: 'Project Libraries',
  prodEnabled: false,
  setupMode: 'minimal',
  prepareTrendViews: trendViews,
  entry: [{ type: 'tab', label: 'Project Libraries' }],
  steps: reports.map(option => ({ type: 'report', name: option, option }))
};
