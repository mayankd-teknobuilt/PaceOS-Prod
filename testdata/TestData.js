function getProjectData() {
  return {
    projectName: process.env.PROD_PROJECT_NAME?.trim() || '',
    Module: process.env.PROD_PHASE?.trim() || '',
    subModule: process.env.PROD_SECTION?.trim() || '',
    subSubModule: process.env.PROD_BLOCK?.trim() || ''
  };
}

module.exports = {
  get projectData() {
    return getProjectData();
  },
  getProjectData
};
