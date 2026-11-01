const MANAGEMENT_TAB_NAMES = ['Lower Management', 'Middle Management', 'Higher Management'];

const MANAGEMENT_TAB_PATTERN = /^(Lower|Middle|Higher)\s+Management$/i;

function isManagementTabLabel(label) {
  return MANAGEMENT_TAB_PATTERN.test(String(label || '').trim());
}

/** Unique Playwright test / registry name for a report under a management section. */
function reportCaseName(optionLabel, managementTab = null) {
  const option = String(optionLabel || '').trim();
  if (!managementTab) {
    return option;
  }
  return `${managementTab} — ${option}`;
}

function flattenDiscoveryTab(tabData) {
  if (!tabData) {
    return [];
  }

  if (Array.isArray(tabData)) {
    return tabData.map(option => ({
      name: reportCaseName(option),
      option,
      managementTab: null
    }));
  }

  const rows = [];
  for (const [section, names] of Object.entries(tabData)) {
    if (!Array.isArray(names)) continue;
    for (const option of names) {
      const managementTab = section === '_default' || section === '_flat' ? null : section;
      rows.push({
        name: reportCaseName(option, managementTab),
        option,
        managementTab
      });
    }
  }
  return rows;
}

function countDiscoveryTestCases(discovered) {
  let total = 0;
  for (const value of Object.values(discovered || {})) {
    total += flattenDiscoveryTab(value).length;
  }
  return total;
}

module.exports = {
  MANAGEMENT_TAB_NAMES,
  MANAGEMENT_TAB_PATTERN,
  isManagementTabLabel,
  reportCaseName,
  flattenDiscoveryTab,
  countDiscoveryTestCases
};
