const { test } = require('../../../utils/controlTowerFixture');
const { registerSingleReportTest } = require('../../../utils/controlTowerSpec');
const category = require('../../../testdata/control-tower/project-libraries');

registerSingleReportTest(test, category, "Project L3 & L4 activity plan");
