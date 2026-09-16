const { test } = require('../../../utils/controlTowerFixture');
const { registerSingleReportTest } = require('../../../utils/controlTowerSpec');
const category = require('../../../testdata/control-tower/health-and-safety');

registerSingleReportTest(test, category, "Pre-Start User Matrix");
