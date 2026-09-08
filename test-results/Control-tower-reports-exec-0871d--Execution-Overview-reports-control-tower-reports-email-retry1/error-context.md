# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Control-tower-reports\execution-overview.spec.js >> @prod-modules Control Tower - Execution Overview >> navigate all Execution Overview reports
- Location: utils\controlTowerSpec.js:149:5

# Error details

```
TimeoutError: page.waitForEvent: Timeout 30000ms exceeded while waiting for event "download"
=========================== logs ===========================
waiting for event "download"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - button "Menu" [ref=e6] [cursor=pointer]:
        - img [ref=e8]
      - img [ref=e10]
      - paragraph [ref=e11]: "Project:"
      - button "control tower" [ref=e12] [cursor=pointer]:
        - generic [ref=e13]:
          - text: Training
          - img [ref=e14]
      - navigation [ref=e17]:
        - list [ref=e18]:
          - listitem [ref=e19]:
            - generic "Process Train - 2" [ref=e20]:
              - generic [ref=e21]: Process Trai...
          - listitem [ref=e22]:
            - img [ref=e23]
          - listitem [ref=e25]:
            - generic "2200 - Main Piperack" [ref=e26]:
              - generic [ref=e27]: 2200 - Main ...
          - listitem [ref=e28]:
            - img [ref=e29]
          - listitem [ref=e31]:
            - generic "2210-Main Piperack (Level - 5)" [ref=e32]:
              - generic [ref=e33]: 2210-Main Pi...
      - button "notifications" [ref=e34] [cursor=pointer]:
        - img "Notification" [ref=e36]
      - button "Help" [ref=e37] [cursor=pointer]:
        - img "Apps" [ref=e39]
      - generic "CCZJV GOLDEN PASS" [ref=e40]:
        - img [ref=e41]
      - button "Profile" [ref=e42] [cursor=pointer]
  - generic [ref=e48]:
    - img "Pace OS" [ref=e50]
    - list [ref=e51]:
      - listitem [ref=e52]:
        - button "Home Select Project" [ref=e54] [cursor=pointer]:
          - generic [ref=e55]:
            - img "Home" [ref=e57]
            - text: Select Project
      - listitem [ref=e58]:
        - button "Home Home" [ref=e60] [cursor=pointer]:
          - generic [ref=e61]:
            - img "Home" [ref=e63]
            - text: Home
      - listitem [ref=e64]:
        - button "Projects Projects" [ref=e66] [cursor=pointer]:
          - generic [ref=e67]:
            - img "Projects" [ref=e69]
            - text: Projects
      - listitem [ref=e70]:
        - button "Users Users" [ref=e72] [cursor=pointer]:
          - generic [ref=e73]:
            - img "Users" [ref=e75]
            - text: Users
      - listitem [ref=e76]:
        - button "Invite Users Invite Users" [ref=e78] [cursor=pointer]:
          - generic [ref=e79]:
            - img "Invite Users" [ref=e81]
            - text: Invite Users
      - listitem [ref=e82]:
        - button "Organization Organization" [ref=e84] [cursor=pointer]:
          - generic [ref=e85]:
            - img "Organization" [ref=e87]
            - text: Organization
      - listitem [ref=e88]:
        - button "Subscriptions Subscriptions" [ref=e90] [cursor=pointer]:
          - generic [ref=e91]:
            - img "Subscriptions" [ref=e93]
            - text: Subscriptions
      - listitem [ref=e94]:
        - button "Departments Departments" [ref=e96] [cursor=pointer]:
          - generic [ref=e97]:
            - img "Departments" [ref=e99]
            - text: Departments
      - listitem [ref=e100]:
        - button "Operating Locations Operating Locations" [ref=e102] [cursor=pointer]:
          - generic [ref=e103]:
            - img "Operating Locations" [ref=e105]
            - text: Operating Locations
      - listitem [ref=e106]:
        - button "Portfolio Manager Portfolio Manager" [ref=e108] [cursor=pointer]:
          - generic [ref=e109]:
            - img "Portfolio Manager" [ref=e111]
            - text: Portfolio Manager
      - listitem [ref=e112]:
        - button "Health Status Health Status" [ref=e114] [cursor=pointer]:
          - generic [ref=e115]:
            - img "Health Status" [ref=e117]
            - text: Health Status
  - main [ref=e118]:
    - generic [ref=e125]:
      - generic [ref=e128]:
        - generic:
          - img
        - tablist "scrollable force tabs example" [ref=e131]:
          - tab "On-Site Construction Execution" [ref=e132] [cursor=pointer]:
            - generic [ref=e133]:
              - img [ref=e134]
              - text: On-Site Construction Execution
          - tab "Health, Safety & Environment" [ref=e135] [cursor=pointer]:
            - generic [ref=e136]:
              - img [ref=e137]
              - text: Health, Safety & Environment
          - tab "Digital Control Tower" [selected] [ref=e138] [cursor=pointer]:
            - generic [ref=e139]:
              - img [ref=e140]
              - text: Digital Control Tower
          - tab "PACE setting PACE Administration" [ref=e141] [cursor=pointer]:
            - generic [ref=e142]:
              - img "PACE setting" [ref=e143]
              - text: PACE Administration
        - generic:
          - img
      - tabpanel "Digital Control Tower" [ref=e145]:
        - paragraph [ref=e147]:
          - generic [ref=e152]:
            - generic [ref=e157] [cursor=pointer]:
              - img "module-icon" [ref=e159]
              - paragraph [ref=e160]: Geoplot Radar
            - generic [ref=e165] [cursor=pointer]:
              - img "module-icon" [ref=e167]
              - paragraph [ref=e168]: Digital Control Tower
            - generic [ref=e173] [cursor=pointer]:
              - img "module-icon" [ref=e175]
              - paragraph [ref=e176]: Action Tracker
            - generic:
              - generic:
                - generic:
                  - img "module-icon"
                - paragraph: HSE Plus Control Tower
            - generic:
              - generic:
                - generic:
                  - img "module-icon"
                - paragraph: McDermott PowerBI
          - list [ref=e178]:
            - listitem [ref=e179]:
              - generic [ref=e182]: Active
            - listitem [ref=e183]:
              - generic [ref=e186]: Inactive
            - listitem [ref=e187]:
              - generic [ref=e190]: Access restricted
```

# Test source

```ts
  145 |       await this.openListbox.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
  146 |       await this.reportsPage.waitForTimeout(150);
  147 |     }
  148 |   }
  149 | 
  150 |   async waitForControlTowerShell() {
  151 |     await expect(this.reportsPage).toHaveURL(CONTROL_TOWER_URL, { timeout: 60000 });
  152 |     await this.reportsPage.waitForLoadState('domcontentloaded', { timeout: 60000 });
  153 |     await expect(this.reportsPage.locator('body')).not.toBeEmpty({ timeout: 20000 });
  154 |     await pauseForVisibility(this.reportsPage, 'Control Tower portfolio ready');
  155 |   }
  156 | 
  157 |   async waitForReportSettle({ quick = false } = {}) {
  158 |     if (await this.loadingIndicator.count()) {
  159 |       await this.loadingIndicator.first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
  160 |     }
  161 | 
  162 |     const fast = isFastMode();
  163 |     const settleMs = quick ? (fast ? 100 : 250) : fast ? 200 : 800;
  164 |     if (settleMs > 0) {
  165 |       await this.reportsPage.waitForTimeout(settleMs);
  166 |     }
  167 |   }
  168 | 
  169 |   async waitForSetupStep(viewName) {
  170 |     await this.reportsPage.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
  171 | 
  172 |     if (await this.loadingIndicator.count()) {
  173 |       await this.loadingIndicator.first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
  174 |     }
  175 | 
  176 |     await this.dismissOpenMenus();
  177 |     await this.waitForReportSettle({ quick: true });
  178 |     logger.info(`Setup step ready: ${viewName}`);
  179 |   }
  180 | 
  181 |   async waitForViewLoaded(viewName) {
  182 |     await this.reportsPage.waitForLoadState('domcontentloaded', { timeout: 60000 });
  183 | 
  184 |     if (await this.loadingIndicator.count()) {
  185 |       await this.loadingIndicator.first().waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});
  186 |     }
  187 | 
  188 |     if (!isFastMode()) {
  189 |       await this.reportsPage.waitForLoadState('load', { timeout: 60000 }).catch(() => {});
  190 |       await this.reportsPage.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {
  191 |         logger.info(`networkidle timeout for "${viewName}"; continuing after load event.`);
  192 |       });
  193 |     }
  194 | 
  195 |     await this.waitForReportSettle();
  196 | 
  197 |     await expect(
  198 |       this.reportsPage.locator('body'),
  199 |       `View "${viewName}" rendered an empty page.`
  200 |     ).not.toBeEmpty({ timeout: 20000 });
  201 | 
  202 |     await pauseForVisibility(this.reportsPage, `Loaded: ${viewName}`);
  203 |   }
  204 | 
  205 |   async assertNoVisibleErrorPage() {
  206 |     await expect(
  207 |       this.reportsPage.locator(VISIBLE_ERROR_SELECTORS),
  208 |       'Control Tower shows a visible error state.'
  209 |     ).toHaveCount(0, { timeout: 5000 });
  210 |   }
  211 | 
  212 |   async assertSetupClean(errorMonitor) {
  213 |     await this.dismissOpenMenus();
  214 |     errorMonitor.assertClean();
  215 |   }
  216 | 
  217 |   async assertStepClean(errorMonitor) {
  218 |     await this.waitForReportSettle();
  219 |     await this.assertNoVisibleErrorPage();
  220 |     errorMonitor.assertClean();
  221 |   }
  222 | 
  223 |   /**
  224 |    * No data → download disabled is OK.
  225 |    * Data present → download must succeed or the test fails.
  226 |    */
  227 |   async assertDownloadBehavior(reportName) {
  228 |     const downloadBtn = this.downloadButton.first();
  229 |     const downloadVisible = await downloadBtn.isVisible().catch(() => false);
  230 | 
  231 |     if (!downloadVisible) {
  232 |       logger.info(`Report "${reportName}" has no Download CSV button — skipping download check.`);
  233 |       return;
  234 |     }
  235 | 
  236 |     const noData = await this.noDataMessage.isVisible().catch(() => false);
  237 |     const isDisabled = await downloadBtn.isDisabled();
  238 | 
  239 |     if (noData || isDisabled) {
  240 |       logger.info(`Report "${reportName}" has no data — download not required.`);
  241 |       return;
  242 |     }
  243 | 
  244 |     logger.info(`Report "${reportName}" has data — verifying CSV download.`);
> 245 |     const downloadPromise = this.reportsPage.waitForEvent('download', { timeout: 30000 });
      |                                              ^ TimeoutError: page.waitForEvent: Timeout 30000ms exceeded while waiting for event "download"
  246 |     await downloadBtn.click();
  247 |     const download = await downloadPromise;
  248 | 
  249 |     expect(download, `Report "${reportName}" download did not start.`).toBeTruthy();
  250 |     const filename = download.suggestedFilename();
  251 |     expect(filename, `Report "${reportName}" returned an empty filename.`).toBeTruthy();
  252 |     logger.info(`Report "${reportName}" downloaded: ${filename}`);
  253 |     await this.reportsPage.bringToFront();
  254 |   }
  255 | 
  256 |   async clickButton(label, stepName, options = {}) {
  257 |     const button = options.filter
  258 |       ? this.filterButtonLocator(label)
  259 |       : this.buttonLocator(label, { exact: options.exact ?? true });
  260 | 
  261 |     await expect(button, `Button "${label}" was not found.`).toBeVisible({ timeout: 20000 });
  262 |     await button.click();
  263 | 
  264 |     if (options.setup) {
  265 |       await this.waitForSetupStep(stepName || label);
  266 |       return;
  267 |     }
  268 | 
  269 |     if (options.filter) {
  270 |       await this.waitForReportSettle({ quick: true });
  271 |       return;
  272 |     }
  273 | 
  274 |     await this.waitForViewLoaded(stepName || label);
  275 |   }
  276 | 
  277 |   async openTab(label, options = {}) {
  278 |     const tab = this.tabLocator(label);
  279 |     await expect(tab, `Tab "${label}" was not found.`).toBeVisible({ timeout: 20000 });
  280 |     await tab.click();
  281 |     await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 10000 });
  282 | 
  283 |     if (options.setup) {
  284 |       await this.waitForSetupStep(`Opened tab: ${label}`);
  285 |       return;
  286 |     }
  287 | 
  288 |     await this.waitForReportSettle();
  289 |     await pauseForVisibility(this.reportsPage, `Opened tab: ${label}`);
  290 |   }
  291 | 
  292 |   async selectReport(step, options = {}) {
  293 |     await this.ensureControlTowerTabActive();
  294 | 
  295 |     await expect(async () => {
  296 |       await this.dismissOpenMenus();
  297 | 
  298 |       const combobox = await this.findVisibleIntelligenceCombobox();
  299 |       expect(combobox, `Combobox not found for "${step.name}".`).toBeTruthy();
  300 | 
  301 |       await combobox.scrollIntoViewIfNeeded();
  302 |       await combobox.click();
  303 | 
  304 |       const option = this.optionLocator(step.option);
  305 |       await expect(option, `Report option "${step.option}" was not visible.`).toBeVisible({
  306 |         timeout: 10000
  307 |       });
  308 |       await option.scrollIntoViewIfNeeded();
  309 |       await option.click();
  310 |       await this.dismissOpenMenus();
  311 |     }).toPass({ timeout: 45000 });
  312 | 
  313 |     if (options.setup) {
  314 |       await this.waitForSetupStep(step.name);
  315 |       return;
  316 |     }
  317 | 
  318 |     await this.waitForViewLoaded(step.name);
  319 |   }
  320 | 
  321 |   async executeStep(step, options = {}) {
  322 |     if (step.type === 'tab') {
  323 |       await this.openTab(step.label, options);
  324 |       return;
  325 |     }
  326 | 
  327 |     if (step.type === 'button') {
  328 |       const isFilter = ['Stopped', 'CWP', 'EWP', 'IWP'].includes(step.label);
  329 |       await this.clickButton(step.label, step.name, { filter: isFilter, setup: options.setup });
  330 |       return;
  331 |     }
  332 | 
  333 |     if (step.type === 'report') {
  334 |       await this.selectReport(step, options);
  335 |     }
  336 |   }
  337 | 
  338 |   async openTrendViews(trendLabels, test, errorMonitor) {
  339 |     await test.step('Trend Views', async () => {
  340 |       for (const label of trendLabels) {
  341 |         await test.step(`Trend: ${label}`, async () => {
  342 |           errorMonitor.reset();
  343 |           await this.clickButton(label, label);
  344 |           await this.assertStepClean(errorMonitor);
  345 |         });
```