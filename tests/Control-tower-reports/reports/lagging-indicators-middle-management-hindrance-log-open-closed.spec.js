const { test } = require('../../../utils/controlTowerFixture');
const { registerSingleReportTest } = require('../../../utils/controlTowerSpec');
const category = require('../../../testdata/control-tower/lagging-indicators');

registerSingleReportTest(test, category, "Middle Management — Hindrance Log (Open/Closed)");
