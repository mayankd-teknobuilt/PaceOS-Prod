const reports = [
  'Activity Breakdown L1-L5',
  '3D Scope Matrix',
  'IWP-ITP Document Matrix',
  'CWP/EWP Scope Matrix',
  'GWBS',
  'CWP/EWP/IWP Register',
  'IWP Readiness Sub-System Register',
  'Completions Progress Sub-System Register',
  'IWP-Tag-Document Register',
  'Progress Measurement',
  'ITP Inspection Register',
  'Project ITP Work Steps',
  'Master Tag Register',
  'Project Engineering Document Deliverable Register',
  'Project L3 & L4 activity plan dates',
  'L4 Norms Matrix',
  'QIR NCR',
  'VTT Variance',
  'Quality Punch List',
  'Jawda (Minor Quality Observation)'
];

module.exports = {
  slug: 'project-libraries',
  name: 'Project Libraries',
  prodEnabled: false,
  enabledEnvs: ['dev3'],
  setupMode: 'minimal',
  entry: [{ type: 'tab', label: 'Project Libraries' }],
  steps: reports.map(option => ({ type: 'report', name: option, option }))
};
