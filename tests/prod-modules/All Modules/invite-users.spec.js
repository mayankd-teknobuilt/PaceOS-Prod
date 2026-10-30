const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const InviteUsersPage = require('../../../pages/modules/invite-users');

test.describe('@pace-env-all @prod-modules Invite Users', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Invite Users'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new InviteUsersPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
