module.exports = {

  slug: 'leading-indicators',

  name: 'Leading Indicators',

  prodEnabled: false,

  enabledEnvs: ['dev3'],

  setupMode: 'management-sections',

  entry: [{ type: 'tab', label: 'Leading Indicators' }],

  steps: [

  { type: 'report', name: "Lower Management — Action Closure Time", option: "Action Closure Time", managementTab: "Lower Management" },
  { type: 'report', name: "Lower Management — CWP Trend", option: "CWP Trend", managementTab: "Lower Management" },
  { type: 'report', name: "Lower Management — Daily Progress Intelligence", option: "Daily Progress Intelligence", managementTab: "Lower Management" },
  { type: 'report', name: "Lower Management — EWP Trend", option: "EWP Trend", managementTab: "Lower Management" },
  { type: 'report', name: "Lower Management — Hindrance Log (Open/Closed)", option: "Hindrance Log (Open/Closed)", managementTab: "Lower Management" },
  { type: 'report', name: "Lower Management — Inspection Clearance Rate", option: "Inspection Clearance Rate", managementTab: "Lower Management" },
  { type: 'report', name: "Lower Management — IWP Compiled vs. Not Compiled IWPs", option: "IWP Compiled vs. Not Compiled IWPs", managementTab: "Lower Management" },
  { type: 'report', name: "Lower Management — IWP Progress Summary", option: "IWP Progress Summary", managementTab: "Lower Management" },
  { type: 'report', name: "Lower Management — Man-Hour Productivity Rate", option: "Man-Hour Productivity Rate", managementTab: "Lower Management" },
  { type: 'report', name: "Lower Management — Onsite Trend", option: "Onsite Trend", managementTab: "Lower Management" },
  { type: 'report', name: "Lower Management — Progress Measurement System", option: "Progress Measurement System", managementTab: "Lower Management" },
  { type: 'report', name: "Lower Management — Schedule Closeout Adherence Rate", option: "Schedule Closeout Adherence Rate", managementTab: "Lower Management" },
  { type: 'report', name: "Lower Management — Schedule Start Performance Index", option: "Schedule Start Performance Index", managementTab: "Lower Management" },
  { type: 'report', name: "Lower Management — Work Package Completion Rate", option: "Work Package Completion Rate", managementTab: "Lower Management" },
  { type: 'report', name: "Middle Management — Action Closure Time", option: "Action Closure Time", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — Change Order Frequency & Impact", option: "Change Order Frequency & Impact", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — CWP Analytics", option: "CWP Analytics", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — CWP Preparation Leadership Risks", option: "CWP Preparation Leadership Risks", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — CWP Preparation Management Summary", option: "CWP Preparation Management Summary", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — CWP Preparation Team Lead Summary", option: "CWP Preparation Team Lead Summary", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — CWP Readiness Ratio", option: "CWP Readiness Ratio", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — CWP Trend", option: "CWP Trend", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — EWP Analytics", option: "EWP Analytics", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — EWP Release Summary", option: "EWP Release Summary", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — EWP Team Summary", option: "EWP Team Summary", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — EWP Tree Summary", option: "EWP Tree Summary", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — EWP Trend", option: "EWP Trend", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — IWP Analytics", option: "IWP Analytics", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — IWP Stage Overview", option: "IWP Stage Overview", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — IWP Unit/Area based Roll-Up", option: "IWP Unit/Area based Roll-Up", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — Onsite Trend", option: "Onsite Trend", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — Schedule Performance Index (SPI)", option: "Schedule Performance Index (SPI)", managementTab: "Middle Management" },
  { type: 'report', name: "Middle Management — Work Package Completion Rate", option: "Work Package Completion Rate", managementTab: "Middle Management" },
  { type: 'report', name: "Higher Management — EWP Leadership Summary", option: "EWP Leadership Summary", managementTab: "Higher Management" },
  { type: 'report', name: "Higher Management — IWP Release Execution Status", option: "IWP Release Execution Status", managementTab: "Higher Management" },
  { type: 'report', name: "Higher Management — Schedule Performance Index (SPI)", option: "Schedule Performance Index (SPI)", managementTab: "Higher Management" }

  ]

};

