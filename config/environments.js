/**
 * Built-in environment profiles. Override any value via .env.local or .env.<profile>.local.
 * Select profile with PACE_ENV=prod | dev3 (default: prod).
 */
const ENVIRONMENT_PROFILES = {
  prod: {
    label: 'Production (Golden Pass LNG)',
    defaults: {
      BASE_URL: 'https://goldenpasslng.pace-os.com/',
      CONTROL_TOWER_PORTFOLIO_URL: 'https://us-controltower.pace-os.com/#/portfolio?page=1',
      CONTROL_TOWER_URL_PATTERN: 'controltower\\.pace-os\\.com',
      PROD_CONTROL_TOWER_TAB: 'Digital Control Tower',
      PROD_CONTROL_TOWER_MODULE: 'Digital Control Tower',
      PROD_USE_FIRST_PROJECT: 'true',
      PROD_PHASE: 'Process Train - 2',
      PROD_SECTION: '2200 - Main Piperack',
      PROD_BLOCK: '2210-Main Piperack (Level - 5)'
    }
  },
  dev3: {
    label: 'Dev Company 3',
    defaults: {
      BASE_URL: 'https://dev-company3.pace-os.com/',
      CONTROL_TOWER_PORTFOLIO_URL: 'https://dev-in-controltower.pace-os.com/#/portfolio?page=1',
      CONTROL_TOWER_URL_PATTERN: 'dev-in-controltower\\.pace-os\\.com',
      PROD_CONTROL_TOWER_TAB: 'Advanced Project Engineering',
      PROD_CONTROL_TOWER_MODULE: 'Advanced Analytics',
      PROD_USE_FIRST_PROJECT: 'false',
      PROD_PROJECT_NAME: 'Al Shomou Athel Project',
      PROD_PROJECT_CODE: 'ASP',
      PROD_PHASE: 'On Plot',
      PROD_SECTION: 'Common',
      PROD_BLOCK: 'Plot Preparation Area'
    }
  }
};

module.exports = { ENVIRONMENT_PROFILES };
