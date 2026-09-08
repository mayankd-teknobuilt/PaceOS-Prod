const { test } = require('../../utils/controlTowerFixture');
const { registerCategorySessionTest } = require('../../utils/controlTowerSpec');
const projectLibraries = require('../../testdata/control-tower/project-libraries');

registerCategorySessionTest(test, projectLibraries);
