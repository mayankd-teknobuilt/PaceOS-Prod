const { test } = require('../../utils/controlTowerFixture');
const { registerCategorySessionTest } = require('../../utils/controlTowerSpec');
const standardLibraries = require('../../testdata/control-tower/standard-libraries');

registerCategorySessionTest(test, standardLibraries);
