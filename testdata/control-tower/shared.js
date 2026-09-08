const { projectData } = require('../TestData');



const portfolioUrl =

  process.env.CONTROL_TOWER_PORTFOLIO_URL ||

  'https://us-controltower.pace-os.com/#/portfolio?page=1';



const CONTROL_TOWER_URL = /us-controltower\.pace-os\.com/i;

const projectName = projectData.projectName;



const trendViews = [
  'Utilization Trend',
  'Daily Progress User Matrix'
];



module.exports = {

  portfolioUrl,

  CONTROL_TOWER_URL,

  projectName,

  trendViews

};


