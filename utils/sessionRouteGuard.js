/**
 * Abort legacy SSO logout redirects that invalidate the shared worker session
 * when same-tab modules or project wizard races fire background navigations.
 */
const LOGOUT_URL = /\/user\/logout|do=\/user\/logout/i;

function attachSessionRouteGuard(context) {
  if (context.__paceSessionRouteGuard) {
    return;
  }
  context.__paceSessionRouteGuard = true;

  context.route('**/*', route => {
    const url = route.request().url();
    if (LOGOUT_URL.test(url)) {
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });
}

module.exports = { attachSessionRouteGuard, LOGOUT_URL };
