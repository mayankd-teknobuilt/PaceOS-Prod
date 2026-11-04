const path = require('path');
const { loadProdEnv } = require('../utils/loadEnv');
const { sendReportViaPowerAutomate } = require('../utils/qaReportEmail');

loadProdEnv(path.resolve(__dirname, '..'));

sendReportViaPowerAutomate()
  .then(code => process.exit(code))
  .catch(error => {
    console.error('[email] Failed to send report:', error.message);
    process.exit(1);
  });
