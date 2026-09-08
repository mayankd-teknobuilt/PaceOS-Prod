# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Control-tower-reports\execution-overview.spec.js >> @prod-modules Control Tower - Execution Overview >> navigate all Execution Overview reports
- Location: utils\controlTowerSpec.js:149:5

# Error details

```
Error: 2 report(s) failed after retry:
  - [Execution Overview] IWP Stage Overview: Application errors detected:
HTTP 401: https://us-dataservices-api.paceos.io/api/v1/analytics/iwp/stage-overview-charts/?projectId=4&release_stage=All
HTTP 401: https://us-dataservices-api.paceos.io/api/v1/analytics/iwp/released-stage-status/?projectId=4&release_stage=All&page=1&limit=1000
HTTP 401: https://us-dataservices-api.paceos.io/api/v1/analytics/iwp/stage-overview-charts/?projectId=4&release_stage=All
HTTP 401: https://us-dataservices-api.paceos.io/api/v1/analytics/iwp/released-stage-status/?projectId=4&release_stage=All&page=1&limit=1000
  - [Execution Overview] PMID-wise Progress: page.waitForEvent: Timeout 30000ms exceeded while waiting for event "download"
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
      - button "Profile" [ref=e42] [cursor=pointer]:
        - generic [ref=e44]: PM
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
  3   |   buildAllReportTestCases,
  4   |   splitIntoWorkerBatches
  5   | } = require('./controlTowerParallel');
  6   | const logger = require('./logger');
  7   | 
  8   | const REPORT_ATTEMPTS = 2;
  9   | 
  10  | async function runSetupSteps(reportsPage, setupSteps, errorMonitor) {
  11  |   for (const step of setupSteps) {
  12  |     errorMonitor.reset();
  13  |     await reportsPage.executeStep(step, { setup: true });
  14  |     await reportsPage.assertSetupClean(errorMonitor);
  15  |   }
  16  | }
  17  | 
  18  | async function runReportBody(testCase, { navigation, errorMonitor, test }) {
  19  |   const { reportsPage } = navigation;
  20  |   await reportsPage.ensureControlTowerTabActive();
  21  | 
  22  |   if (testCase.setupSteps.length) {
  23  |     await test.step(`Setup: ${testCase.reportName}`, async () => {
  24  |       await runSetupSteps(reportsPage, testCase.setupSteps, errorMonitor);
  25  |     });
  26  |   }
  27  | 
  28  |   errorMonitor.reset();
  29  |   await reportsPage.executeStep(testCase.reportStep, { setup: false });
  30  | 
  31  |   if (testCase.reportStep.type === 'report') {
  32  |     await reportsPage.assertDownloadBehavior(testCase.reportName);
  33  |   }
  34  | 
  35  |   await reportsPage.assertStepClean(errorMonitor);
  36  | }
  37  | 
  38  | /**
  39  |  * Run one report with a single retry. On final failure, log a failed step in the
  40  |  * report but return the error so the batch can continue.
  41  |  */
  42  | async function runReportWithRetry(testCase, { navigation, errorMonitor, test }) {
  43  |   let lastError = null;
  44  | 
  45  |   for (let attempt = 1; attempt <= REPORT_ATTEMPTS; attempt++) {
  46  |     const stepLabel =
  47  |       attempt === 1 ? testCase.reportName : `${testCase.reportName} (retry)`;
  48  | 
  49  |     try {
  50  |       await test.step(stepLabel, async () => {
  51  |         await runReportBody(testCase, { navigation, errorMonitor, test });
  52  |       });
  53  |       return null;
  54  |     } catch (error) {
  55  |       lastError = error;
  56  |       logger.warn(
  57  |         `Report "${testCase.reportName}" attempt ${attempt}/${REPORT_ATTEMPTS} failed: ${error.message}`
  58  |       );
  59  | 
  60  |       if (attempt < REPORT_ATTEMPTS) {
  61  |         await navigation.reportsPage.ensureControlTowerTabActive();
  62  |         await navigation.reportsPage.waitForReportSettle({ quick: true });
  63  |       }
  64  |     }
  65  |   }
  66  | 
  67  |   await test
  68  |     .step(`${testCase.reportName} — FAILED after retry`, async () => {
  69  |       throw lastError;
  70  |     })
  71  |     .catch(() => {});
  72  | 
  73  |   return {
  74  |     reportName: testCase.reportName,
  75  |     categoryName: testCase.categoryName,
  76  |     error: lastError
  77  |   };
  78  | }
  79  | 
  80  | async function runReportsBatch(testCases, { controlTower, test }) {
  81  |   const failures = [];
  82  | 
  83  |   for (const testCase of testCases) {
  84  |     const failure = await runReportWithRetry(testCase, {
  85  |       navigation: controlTower.navigation,
  86  |       errorMonitor: controlTower.errorMonitor,
  87  |       test
  88  |     });
  89  | 
  90  |     if (failure) {
  91  |       failures.push(failure);
  92  |     }
  93  |   }
  94  | 
  95  |   if (failures.length) {
  96  |     const summary = failures
  97  |       .map(
  98  |         failure =>
  99  |           `  - [${failure.categoryName}] ${failure.reportName}: ${failure.error.message}`
  100 |       )
  101 |       .join('\n');
  102 | 
> 103 |     throw new Error(`${failures.length} report(s) failed after retry:\n${summary}`);
      |           ^ Error: 2 report(s) failed after retry:
  104 |   }
  105 | }
  106 | 
  107 | /**
  108 |  * Run every report in a category inside an already-open Control Tower session.
  109 |  */
  110 | async function runCategoryInSession(category, { controlTower, test }) {
  111 |   if (category.prodEnabled === false) {
  112 |     return;
  113 |   }
  114 | 
  115 |   const cases = buildReportTestCases(category);
  116 | 
  117 |   await test.step(category.name, async () => {
  118 |     await runReportsBatch(cases, { controlTower, test });
  119 |   });
  120 | }
  121 | 
  122 | /**
  123 |  * Run all enabled categories in one Control Tower session (login + CT open once).
  124 |  */
  125 | async function runAllReportsInSession({ controlTower, test }) {
  126 |   const { categories } = require('../testdata/control-tower');
  127 | 
  128 |   for (const category of categories) {
  129 |     await runCategoryInSession(category, { controlTower, test });
  130 |   }
  131 | }
  132 | 
  133 | /**
  134 |  * One test per category — all reports sequential, CT tab stays open between reports.
  135 |  */
  136 | function registerCategorySessionTest(test, category) {
  137 |   if (category.prodEnabled === false) {
  138 |     test.describe.skip(`@prod-modules Control Tower - ${category.name}`, () => {
  139 |       test('not available on production Control Tower', () => {});
  140 |     });
  141 |     return;
  142 |   }
  143 | 
  144 |   const cases = buildReportTestCases(category);
  145 | 
  146 |   test.describe.configure({ mode: 'serial' });
  147 | 
  148 |   test.describe(`@prod-modules Control Tower - ${category.name}`, () => {
  149 |     test(`navigate all ${category.name} reports`, async ({ controlTower }) => {
  150 |       test.setTimeout(900000);
  151 | 
  152 |       await test.step(category.name, async () => {
  153 |         await runReportsBatch(cases, { controlTower, test });
  154 |       });
  155 |     });
  156 |   });
  157 | }
  158 | 
  159 | /**
  160 |  * Split all reports across parallel workers. Each worker logs in once and opens
  161 |  * Control Tower once, then runs its batch with per-report retry.
  162 |  */
  163 | function registerAllReportsSessionTest(test, { workers = 4 } = {}) {
  164 |   const allCases = buildAllReportTestCases();
  165 |   const batches = splitIntoWorkerBatches(allCases, workers);
  166 | 
  167 |   test.describe.configure({ mode: 'parallel' });
  168 | 
  169 |   test.describe('@prod-modules Control Tower Reports', () => {
  170 |     batches.forEach((batch, index) => {
  171 |       test(`batch ${index + 1} — ${batch.length} reports`, async ({ controlTower }) => {
  172 |         test.setTimeout(900000);
  173 |         await runReportsBatch(batch, { controlTower, test });
  174 |       });
  175 |     });
  176 |   });
  177 | }
  178 | 
  179 | module.exports = {
  180 |   runSetupSteps,
  181 |   runReportBody,
  182 |   runReportWithRetry,
  183 |   runReportsBatch,
  184 |   runCategoryInSession,
  185 |   runAllReportsInSession,
  186 |   registerCategorySessionTest,
  187 |   registerAllReportsSessionTest,
  188 |   buildReportTestCases,
  189 |   buildAllReportTestCases
  190 | };
  191 | 
```