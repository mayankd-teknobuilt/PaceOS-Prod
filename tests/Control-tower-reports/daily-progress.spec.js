const { test } = require('../../utils/controlTowerFixture');
const { registerCategorySessionTest } = require('../../utils/controlTowerSpec');
const dailyProgress = require('../../testdata/control-tower/daily-progress');

registerCategorySessionTest(test, dailyProgress);
