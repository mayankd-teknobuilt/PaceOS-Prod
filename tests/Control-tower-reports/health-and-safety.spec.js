const { test } = require('../../utils/controlTowerFixture');
const { registerCategorySessionTest } = require('../../utils/controlTowerSpec');
const healthAndSafety = require('../../testdata/control-tower/health-and-safety');

registerCategorySessionTest(test, healthAndSafety);
