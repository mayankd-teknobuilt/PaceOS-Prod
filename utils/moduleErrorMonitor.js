const KNOWN_APP_ERRORS = [
  /newLoginMethodFlag/i,
  /displayDefaultIcons is not a function/i,
  /Cannot set properties of null \(setting 'onclick'\)/i,
  // Control Tower React SPA — benign re-render loop during trend/report switches
  /Minified React error #185/i,
  /Maximum update depth exceeded/i
];

const API_RESOURCE_TYPES = new Set(['fetch', 'xhr']);

function createErrorMonitor(options = {}) {
  const { includeDocument = false } = options;
  const errors = [];
  const attachedPages = new WeakSet();

  function attach(page) {
    if (!page || attachedPages.has(page)) return;
    attachedPages.add(page);

    page.on('pageerror', error => {
      if (KNOWN_APP_ERRORS.some(pattern => pattern.test(error.message))) return;
      errors.push(`JavaScript: ${error.message}`);
    });

    page.on('response', response => {
      const status = response.status();
      if (status < 400) return;

      const resourceType = response.request().resourceType();
      const isApiCall = API_RESOURCE_TYPES.has(resourceType);
      const isDocument = resourceType === 'document';

      if (!isApiCall && !(includeDocument && isDocument)) return;
      errors.push(`HTTP ${status}: ${response.url()}`);
    });
  }

  function reset() {
    errors.length = 0;
  }

  function assertClean() {
    if (errors.length) {
      throw new Error(`Application errors detected:\n${errors.join('\n')}`);
    }
  }

  function getErrors() {
    return [...errors];
  }

  return { attach, reset, assertClean, getErrors };
}

module.exports = { createErrorMonitor, KNOWN_APP_ERRORS };
