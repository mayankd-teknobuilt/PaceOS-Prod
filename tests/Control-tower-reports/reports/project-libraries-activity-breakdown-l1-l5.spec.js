const { test } = require('../../../utils/controlTowerFixture');
const { registerSingleReportTest } = require('../../../utils/controlTowerSpec');
const category = require('../../../testdata/control-tower/project-libraries');

registerSingleReportTest(test, category, "Activity Breakdown L1-L5");
