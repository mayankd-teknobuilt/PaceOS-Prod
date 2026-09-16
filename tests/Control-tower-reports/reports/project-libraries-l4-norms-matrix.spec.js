const { test } = require('../../../utils/controlTowerFixture');
const { registerSingleReportTest } = require('../../../utils/controlTowerSpec');
const category = require('../../../testdata/control-tower/project-libraries');

registerSingleReportTest(test, category, "L4 Norms Matrix");
