const { test } = require('../../../utils/controlTowerFixture');
const { registerSingleReportTest } = require('../../../utils/controlTowerSpec');
const category = require('../../../testdata/control-tower/leading-indicators');

registerSingleReportTest(test, category, "EWP Trend");
