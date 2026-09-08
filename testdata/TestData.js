module.exports = {
  projectData: {
    projectName: process.env.PROD_PROJECT_NAME?.trim() || '',
    Module: process.env.PROD_PHASE?.trim() || 'Process Train - 2',
    subModule: process.env.PROD_SECTION?.trim() || '2200 - Main Piperack',
    subSubModule: process.env.PROD_BLOCK?.trim() || '2210-Main Piperack (Level - 5)'
  }
};
