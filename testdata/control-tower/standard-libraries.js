const reports = [
  'Geographical WBS',
  'Activity Breakdown Structure',
  'IWP-PLIP Matrix',
  'Productivity Norms',
  'PLIP Classification',
  'ITP Work Step'
];

module.exports = {
  slug: 'standard-libraries',
  name: 'Standard Libraries',
  prodEnabled: false,
  enabledEnvs: ['dev3'],
  setupMode: 'minimal',
  entry: [{ type: 'tab', label: 'Standard Libraries' }],
  steps: reports.map(option => ({ type: 'report', name: option, option }))
};
