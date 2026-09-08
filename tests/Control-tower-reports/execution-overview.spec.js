const { test } = require('../../utils/controlTowerFixture');
const { registerCategorySessionTest } = require('../../utils/controlTowerSpec');
const executionOverview = require('../../testdata/control-tower/execution-overview');

registerCategorySessionTest(test, executionOverview);
