const { test } = require('../../../utils/controlTowerFixture');
const { registerSingleReportTest } = require('../../../utils/controlTowerSpec');
const category = require('../../../testdata/control-tower/daily-progress');

registerSingleReportTest(test, category, "Daily Progress User Matrix");
