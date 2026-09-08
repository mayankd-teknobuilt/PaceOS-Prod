const { test } = require('../../../utils/prodModuleFixture');
const InviteUsersPage = require('../../../pages/modules/invite-users');

test.describe('@prod-modules Invite Users', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new InviteUsersPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
