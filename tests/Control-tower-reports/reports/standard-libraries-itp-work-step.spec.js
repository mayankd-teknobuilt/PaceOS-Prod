const { test } = require('../../../utils/controlTowerFixture');
const { registerSingleReportTest } = require('../../../utils/controlTowerSpec');
const category = require('../../../testdata/control-tower/standard-libraries');

registerSingleReportTest(test, category, "ITP Work Step");
