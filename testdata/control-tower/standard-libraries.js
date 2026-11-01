const reports = [

  "Activity Breakdown Structure",
  "Geographical WBS",
  "ITP Work Step",
  "IWP-PLIP Matrix",
  "PLIP Classification",
  "Productivity Norms"

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

