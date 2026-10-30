const { expect } = require('@playwright/test');
const ProjectPage = require('../pages/ProjectPage');
const { getProjectData } = require('../testdata/TestData');
const logger = require('./logger');
const { pauseForVisibility } = require('./stageTiming');

async function isProjectContextSet(page) {
  if (!/dashboard/i.test(page.url())) return false;

  const hasTabs = await page.getByRole('tab').first().isVisible({ timeout: 3000 }).catch(() => false);
  if (!hasTabs) return false;

  const projectData = getProjectData();
  const markers = [projectData.subSubModule, projectData.subModule, projectData.Module].filter(Boolean);
  for (const marker of markers) {
    const breadcrumb = page.locator('nav, [role="navigation"], header').filter({ hasText: marker });
    if (await breadcrumb.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      return true;
    }
  }

  // Tabs visible on /dashboard means project context selection already completed.
  return hasTabs;
}

async function selectFirstMatchingOrFirst(page, projectPage, step, names, selectFn) {
  if (!names?.length) {
    throw new Error(`No ${step} options found after project selection`);
  }
  const chosen = names[0];
  logger.info(`Selecting ${step} (auto): ${chosen}`);
  await selectFn(chosen);
  await pauseForVisibility(page, `${step} selected: ${chosen}`);
  return chosen;
}

async function selectProdProjectContext(page) {
  const baseUrl = process.env.BASE_URL;
  const projectData = getProjectData();
  const context = {
    projectName: projectData.projectName,
    phase: projectData.Module,
    section: projectData.subModule,
    block: projectData.subSubModule
  };

  if (!/\/select-project/i.test(page.url())) {
    await page.goto(new URL('/select-project', baseUrl).toString(), {
      waitUntil: 'domcontentloaded'
    });
  }

  const projectPage = new ProjectPage(page);
  const cardIndex = Number(process.env.PROD_PROJECT_CARD_INDEX || 0);
  const projectCode = process.env.PROD_PROJECT_CODE?.trim() || '';

  if (projectData.projectName) {
    logger.info(`Selecting project: ${context.projectName}`);
    await projectPage.selectProject(context.projectName, projectCode);
    await pauseForVisibility(page, `Project selected: ${context.projectName}`);
  } else if (cardIndex > 0) {
    logger.info(`Selecting project by card index: ${cardIndex}`);
    await projectPage.selectProjectByCardIndex(cardIndex);
    await pauseForVisibility(page, `Project card ${cardIndex} selected`);
  } else if (process.env.PROD_USE_FIRST_PROJECT === 'true') {
    logger.info('Selecting first available project');
    await projectPage.selectFirstProject();
    await pauseForVisibility(page, 'First project selected');
  } else {
    throw new Error(
      'Project not configured: set PROD_PROJECT_CARD_INDEX, PROD_PROJECT_NAME, or PROD_USE_FIRST_PROJECT=true'
    );
  }

  if (context.phase) {
    logger.info(`Selecting phase: ${context.phase}`);
    await projectPage.selectModule(context.phase);
    await pauseForVisibility(page, `Phase selected: ${context.phase}`);
  } else {
    const phases = await page.getByRole('button').evaluateAll(buttons =>
      buttons
        .map(btn => btn.textContent?.trim())
        .filter(text => text && text.length > 2 && !/^continue$/i.test(text))
    );
    if (phases.length) {
      context.phase = await selectFirstMatchingOrFirst(
        page,
        projectPage,
        'phase',
        phases,
        name => projectPage.selectModule(name)
      );
    }
  }

  if (context.section) {
    logger.info(`Selecting section: ${context.section}`);
    await projectPage.selectSubModule(context.section);
    await pauseForVisibility(page, `Section selected: ${context.section}`);
  } else if (context.phase) {
    const sectionButtons = page.getByRole('button');
    const sectionCount = await sectionButtons.count();
    const sectionNames = [];
    for (let i = 0; i < sectionCount; i++) {
      const text = (await sectionButtons.nth(i).innerText()).trim();
      if (text && !/^continue$/i.test(text) && text !== context.phase) {
        sectionNames.push(text);
      }
    }
    if (sectionNames.length) {
      context.section = await selectFirstMatchingOrFirst(
        page,
        projectPage,
        'section',
        sectionNames,
        name => projectPage.selectSubModule(name)
      );
    }
  }

  if (context.block) {
    logger.info(`Selecting block: ${context.block}`);
    await projectPage.selectSubSubModule(context.block);
    await pauseForVisibility(page, `Block selected: ${context.block}`);
  } else if (context.section) {
    const blocks = await page.getByRole('radio').evaluateAll(radios =>
      radios.map(r => r.getAttribute('aria-label') || r.textContent?.trim()).filter(Boolean)
    );
    if (blocks.length) {
      context.block = blocks[0];
      logger.info(`Selecting block (auto): ${context.block}`);
      await projectPage.selectSubSubModule(context.block);
      await pauseForVisibility(page, `Block selected: ${context.block}`);
    }
  }

  logger.info('Clicking Continue');
  await projectPage.clickContinue();
  await pauseForVisibility(page, 'Continue clicked — opening dashboard');

  await page.waitForURL(/dashboard|my-work/i, { timeout: 30000 });
  if (!/dashboard/i.test(page.url())) {
    await page.goto(new URL('/dashboard', baseUrl).toString(), { waitUntil: 'domcontentloaded' });
  }

  await expect(page, 'Dashboard did not open after project context selection.').toHaveURL(/dashboard/i, {
    timeout: 30000
  });
}

module.exports = { selectProdProjectContext, isProjectContextSet };
