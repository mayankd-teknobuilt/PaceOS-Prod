const reports = [

  "3D Scope Matrix",
  "Activity Breakdown L1-L5",
  "Completions Progress Sub-System Register",
  "CWP/EWP Scope Matrix",
  "CWP/EWP/IWP Register",
  "GWBS",
  "ITP Inspection Register",
  "IWP Readiness Sub-System Register",
  "IWP-ITP Document Matrix",
  "IWP-Tag-Document Register",
  "Jawda (Minor Quality Observation)",
  "L4 Norms Matrix",
  "Master Tag Register",
  "Progress Measurement",
  "Project Engineering Document Deliverable Register",
  "Project ITP Work Steps",
  "Project L3 & L4 activity plan dates",
  "QIR NCR",
  "Quality Punch List",
  "VTT Variance"

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

