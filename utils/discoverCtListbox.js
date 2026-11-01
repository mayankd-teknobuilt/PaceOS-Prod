/**
 * Collect all MUI listbox options (virtual scroll) for Control Tower discovery.
 */
async function collectAllListboxOptions(page, combobox, { maxScrollRounds = 40 } = {}) {
  await combobox.scrollIntoViewIfNeeded().catch(() => {});
  await combobox.click();

  const listbox = page.locator('[role="listbox"]:visible');
  await listbox.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

  if (!(await listbox.isVisible().catch(() => false))) {
    await page.keyboard.press('Escape').catch(() => {});
    return [];
  }

  const seen = new Set();

  async function harvestVisibleOptions() {
    const labels = await listbox.getByRole('option').evaluateAll(elements =>
      elements.map(el => el.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean)
    );
    for (const label of labels) {
      if (/^\d+$/.test(label)) continue;
      seen.add(label);
    }
  }

  await harvestVisibleOptions();

  let stagnantRounds = 0;
  for (let round = 0; round < maxScrollRounds; round++) {
    const before = seen.size;

    await listbox.evaluate(element => {
      element.scrollTop += 280;
    }).catch(() => {});
    await page.keyboard.press('ArrowDown').catch(() => {});
    await page.waitForTimeout(120);
    await harvestVisibleOptions();

    if (seen.size === before) {
      stagnantRounds += 1;
      if (stagnantRounds >= 4) {
        break;
      }
    } else {
      stagnantRounds = 0;
    }
  }

  await page.keyboard.press('Escape').catch(() => {});
  await listbox.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});

  return [...seen].sort((a, b) => a.localeCompare(b));
}

async function listControlTowerTabLabels(page) {
  const portfolioList = await resolvePortfolioTabList(page);
  return portfolioList.getByRole('tab').evaluateAll(elements =>
    elements.map(el => el.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean)
  );
}

const MANAGEMENT_ORDER = ['Lower Management', 'Middle Management', 'Higher Management'];

function portfolioTabList(page) {
  return page.locator('[data-portfolio-tablist="true"]');
}

async function resolvePortfolioTabList(page) {
  const marked = portfolioTabList(page);
  if ((await marked.count().catch(() => 0)) > 0) {
    return marked;
  }

  const lists = page.getByRole('tablist');
  const listCount = await lists.count().catch(() => 0);
  let bestList = lists.first();
  let bestSize = 0;

  for (let i = 0; i < listCount; i++) {
    const list = lists.nth(i);
    const tabCount = await list.getByRole('tab').count().catch(() => 0);
    if (tabCount > bestSize) {
      bestSize = tabCount;
      bestList = list;
    }
  }

  return bestList;
}

function tabNamePattern(label) {
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escape(label)}$`, 'i');
}

async function openPortfolioTab(page, label) {
  const pattern = tabNamePattern(label);
  const portfolioList = await resolvePortfolioTabList(page);
  let tab = portfolioList.getByRole('tab', { name: pattern }).first();

  if ((await tab.count().catch(() => 0)) === 0) {
    tab = page.getByRole('tab', { name: pattern }).first();
  }

  if ((await tab.count().catch(() => 0)) === 0) {
    throw new Error(`Portfolio tab not found: ${label}`);
  }

  await portfolioList
    .evaluate((list, tabLabel) => {
      const normalize = text => text?.replace(/\s+/g, ' ').trim() || '';
      for (const element of list.querySelectorAll('[role="tab"]')) {
        if (normalize(element.textContent).toLowerCase() !== tabLabel.toLowerCase()) continue;
        element.scrollIntoView({ block: 'nearest', inline: 'center' });
        return;
      }
    }, label)
    .catch(() => {});

  await tab.scrollIntoViewIfNeeded({ timeout: 8000 }).catch(() => {});
  const selected = (await tab.getAttribute('aria-selected').catch(() => null)) === 'true';
  if (!selected) {
    await tab.click({ timeout: 15000 });
    await tab.click({ timeout: 5000 }).catch(() => {});
  }
  await page.waitForTimeout(1500);
}

async function collectVisibleComboboxOptions(page, reportsPage, { waitMs = 12000 } = {}) {
  const deadline = Date.now() + waitMs;

  while (Date.now() < deadline) {
    await reportsPage.dismissOpenMenus().catch(() => {});
    const combobox = await reportsPage.findVisibleIntelligenceCombobox();
    if (combobox) {
      const options = await collectAllListboxOptions(page, combobox);
      if (options.length) {
        return options;
      }
    }
    await page.waitForTimeout(400);
  }

  return [];
}

async function listManagementSectionLabels(page) {
  const scopes = [
    page.locator('[role="tabpanel"]:visible').last(),
    page.locator('[role="tabpanel"]:visible').first(),
    page
  ];

  for (const scope of scopes) {
    const labels = await scope
      .locator('[role="tab"], button')
      .evaluateAll(elements =>
        elements.map(el => el.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean)
      );

    const mgmt = MANAGEMENT_ORDER.filter(name =>
      labels.some(label => label.toLowerCase() === name.toLowerCase())
    );

    if (mgmt.length) {
      return mgmt;
    }
  }

  return [];
}

async function activateManagementSection(page, label) {
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escape(label)}$`, 'i');
  const panel = page.locator('[role="tabpanel"]:visible').last();

  for (const scope of [panel, page]) {
    const tab = scope.getByRole('tab', { name: pattern });
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      return true;
    }
    const button = scope.getByRole('button', { name: pattern });
    if (await button.isVisible().catch(() => false)) {
      await button.click();
      return true;
    }
  }

  const byText = panel.getByText(pattern).first();
  if (await byText.isVisible().catch(() => false)) {
    await byText.click();
    return true;
  }

  return false;
}

/**
 * Leading / Lagging Indicators: scan Lower, Middle, Higher Management sub-tabs.
 */
async function discoverIndicatorsWithManagementSections(page, reportsPage, mainTabLabel) {
  const sections = {};

  for (const mgmtLabel of MANAGEMENT_ORDER) {
    await openPortfolioTab(page, mainTabLabel);
    await reportsPage.dismissOpenMenus().catch(() => {});

    const activated = await activateManagementSection(page, mgmtLabel);
    if (!activated) {
      console.warn(`[discover-ct] ${mainTabLabel}: could not activate "${mgmtLabel}"`);
      continue;
    }

    await page.waitForTimeout(2000);
    if (reportsPage.waitForReportSettle) {
      await reportsPage.waitForReportSettle({ quick: true }).catch(() => {});
    }

    const options = await collectVisibleComboboxOptions(page, reportsPage, { waitMs: 15000 });
    sections[mgmtLabel] = options;
    console.log(`[discover-ct] ${mainTabLabel} / ${mgmtLabel}: ${options.length} report(s)`);
  }

  const total = Object.values(sections).reduce((sum, list) => sum + (list?.length || 0), 0);
  if (total > 0) {
    return sections;
  }

  await openPortfolioTab(page, mainTabLabel);
  return { _flat: await collectVisibleComboboxOptions(page, reportsPage) };
}

module.exports = {
  collectAllListboxOptions,
  listControlTowerTabLabels,
  collectVisibleComboboxOptions,
  discoverIndicatorsWithManagementSections,
  resolvePortfolioTabList,
  portfolioTabList,
  openPortfolioTab,
  MANAGEMENT_ORDER
};
