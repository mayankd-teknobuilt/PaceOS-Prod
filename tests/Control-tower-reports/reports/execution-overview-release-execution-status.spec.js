const { test } = require('../../../utils/controlTowerFixture');
const { registerSingleReportTest } = require('../../../utils/controlTowerSpec');
const category = require('../../../testdata/control-tower/execution-overview');

registerSingleReportTest(test, category, "Release Execution Status");
