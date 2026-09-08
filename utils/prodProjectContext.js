const { expect } = require('@playwright/test');
const ProjectPage = require('../pages/ProjectPage');
const { projectData } = require('../testdata/TestData');
const logger = require('./logger');
const { pauseForVisibility } = require('./stageTiming');

async function isProjectContextSet(page) {
  if (!/dashboard/i.test(page.url())) return false;

  const hasTabs = await page.getByRole('tab').first().isVisible({ timeout: 3000 }).catch(() => false);
  if (!hasTabs) return false;

  const markers = [projectData.subSubModule, projectData.subModule, projectData.Module].filter(Boolean);
  for (const marker of markers) {
    const breadcrumb = page.locator('nav, [role="navigation"], header').filter({ hasText: marker });
    if (await breadcrumb.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      return true;
    }
  }

  return true;
}

async function selectProdProjectContext(page) {
  const baseUrl = process.env.BASE_URL;
  const useFirstProject =
    process.env.PROD_USE_FIRST_PROJECT === 'true' || !projectData.projectName;
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

  if (useFirstProject) {
    logger.info('Selecting first available production project');
    await projectPage.selectFirstProject();
    await pauseForVisibility(page, 'First project selected');
  } else {
    logger.info(`Selecting project: ${context.projectName}`);
    await projectPage.selectProject(context.projectName);
    await pauseForVisibility(page, `Project selected: ${context.projectName}`);
  }

  logger.info(`Selecting phase: ${context.phase}`);
  await projectPage.selectModule(context.phase);
  await pauseForVisibility(page, `Phase selected: ${context.phase}`);

  logger.info(`Selecting section: ${context.section}`);
  await projectPage.selectSubModule(context.section);
  await pauseForVisibility(page, `Section selected: ${context.section}`);

  logger.info(`Selecting block: ${context.block}`);
  await projectPage.selectSubSubModule(context.block);
  await pauseForVisibility(page, `Block selected: ${context.block}`);

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
