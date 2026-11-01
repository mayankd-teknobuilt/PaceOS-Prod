module.exports = {
  slug: 'lagging-indicators',
  name: 'Lagging Indicators',
  prodEnabled: false,
  enabledEnvs: ['dev3'],
  setupMode: 'management-sections',
  entry: [{ type: 'tab', label: 'Lagging Indicators' }],
  steps: [
    { type: 'report', name: 'Lower Management — Incomplete Work Ratio', option: 'Incomplete Work Ratio', managementTab: 'Lower Management' },
    { type: 'report', name: 'Lower Management — Technical Queries (TQT)', option: 'Technical Queries (TQT)', managementTab: 'Lower Management' },
    { type: 'report', name: 'Lower Management — Hindrance Log (Open/Closed)', option: 'Hindrance Log (Open/Closed)', managementTab: 'Lower Management' },
    { type: 'report', name: 'Lower Management — EWP Supervisor Summary', option: 'EWP Supervisor Summary', managementTab: 'Lower Management' },
    { type: 'report', name: 'Lower Management — CWP Supervisor Summary', option: 'CWP Supervisor Summary', managementTab: 'Lower Management' },
    { type: 'report', name: 'Lower Management — CWP Execution Team Lead', option: 'CWP Execution Team Lead', managementTab: 'Lower Management' },
    { type: 'report', name: 'Middle Management — IWP Planned vs. Actual Earned', option: 'IWP Planned vs. Actual Earned', managementTab: 'Middle Management' },
    { type: 'report', name: 'Middle Management — IWP Detailed Breakdown', option: 'IWP Detailed Breakdown', managementTab: 'Middle Management' },
    { type: 'report', name: 'Middle Management — CWP Execution Leadership', option: 'CWP Execution Leadership', managementTab: 'Middle Management' },
    { type: 'report', name: 'Middle Management — EWP Management Summary', option: 'EWP Management Summary', managementTab: 'Middle Management' },
    { type: 'report', name: 'Middle Management — Hindrance Log (Open/Closed)', option: 'Hindrance Log (Open/Closed)', managementTab: 'Middle Management' },
    { type: 'report', name: 'Higher Management — EWP Management Summary', option: 'EWP Management Summary', managementTab: 'Higher Management' },
    { type: 'report', name: 'Higher Management — IWP Planned vs. Actual Earned', option: 'IWP Planned vs. Actual Earned', managementTab: 'Higher Management' }
  ]
};
