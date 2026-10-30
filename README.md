# PACE Production QA Framework

Playwright Page Object Model framework for dashboard modules and Control Tower reports across multiple PACE environments.

## What it does

1. Logs in with email/password or badge number
2. Selects project context (phase, section, block when configured)
3. Runs each dashboard module as its own parallel test (env-aware registry; skips modules not on that dashboard)
4. Runs each Control Tower report as its own parallel test (49 specs, 4 workers)
5. Retries failed cases once within a 90-second per-test budget
6. Fails on HTTP/JS errors or visible error pages

## Environments

Select a profile with **`PACE_ENV`** (default: **`prod`**). Built-in profiles live in `config/environments.js`.

| Profile | Base URL | Credentials file |
|--------|----------|------------------|
| `prod` | Golden Pass LNG (production) | `.env.local` |
| `dev3` | `https://dev-company3.pace-os.com/` | `.env.dev3.local` |

Auth state is stored per environment under `.auth/<PACE_ENV>/` (gitignored).

### Setup

```bash
npm install
npx playwright install chromium
```

**Production:** copy `.env.example` → `.env.local` and set `TEST_EMAIL` / `TEST_PASSWORD`.

**Dev3:** copy `.env.dev3.example` → `.env.dev3.local` and set credentials (do not commit).

Env load order: `.env` → `.env.local` → `.env.<PACE_ENV>.local` (overrides) → profile defaults from `config/environments.js`.

**Project context** is per profile in `config/environments.js`. Production uses Golden Pass phase/section/block. Dev3 uses **Al Shomou Athel Project (ASP)**, then **On Plot → Common → Plot Preparation Area**. Override with `PROD_PROJECT_NAME`, `PROD_PROJECT_CODE`, `PROD_PHASE`, `PROD_SECTION`, or `PROD_BLOCK` in `.env.dev3.local` if needed.

Discover options for the active environment:

```bash
$env:PACE_ENV='dev3'; npm run discover:prod-project-context
```

## Run locally (both environments)

**One-time setup:** `.env.local` (prod) and `.env.dev3.local` (dev3) with `TEST_EMAIL` / `TEST_PASSWORD`.

From the repo root:

```powershell
cd "C:\Users\Teknobuilt\PACE-QA-Automation-prod(QA)"
```

### Production (Golden Pass) — full suite

```powershell
npm run test:local:prod
```

Modules only / Control Tower only:

```powershell
npm run test:prod:modules
npm run test:prod:control-tower
```

Headed browser:

```powershell
npm run test:local:prod:headed
```

### Dev3 (Company 3 / ASP) — full suite

```powershell
npm run test:local:dev3
```

Modules only / Control Tower only (CT uses 1 worker):

```powershell
npm run test:dev3:modules
npm run test:dev3:control-tower
```

Headed:

```powershell
npm run test:local:dev3:headed
```

### Both environments at once (two processes, 4 workers each)

```powershell
npm run test:both:all
```

### Both environments — prod first, then dev3 (sequential)

```powershell
npm run test:both:prod-first
```

Headed:

```powershell
npm run test:both:prod-first:headed
```

Stops after prod if prod fails (`&&`). Dev3 runs only when prod passes.

Worker count: set `PLAYWRIGHT_WORKERS=4` (Playwright does not receive `--workers` through nested `npm run`). Example:

```powershell
$env:PLAYWRIGHT_WORKERS='4'; npm run test:both:prod-first:headed
```

### Quick reference

| Command | Environment | What runs |
|---------|-------------|-----------|
| `npm run test:local:prod` | prod | All module + CT specs |
| `npm run test:local:dev3` | dev3 | All module + CT specs |
| `npm run test:prod:all` | prod | Same as local prod (no env validate) |
| `npm run test:dev3:all:full` | dev3 | Modules (4 workers) then CT (1 worker) |

```bash
# Production (default) — aliases
npm run test:prod-modules
npm run test:control-tower-reports
npm run test:all

# Dev3
npm run test:dev3:prod-modules
npm run test:dev3:all
```

Or set `PACE_ENV=dev3` explicitly:

```bash
cross-env PACE_ENV=dev3 npm run test:prod-modules
```

## Regenerate tests

```bash
npm run discover:prod-modules
npm run discover:dev3-modules
npm run merge:module-registries
npm run generate:prod-modules
npm run generate:control-tower-reports
```

Module sanity specs **skip automatically** when a module is not on the active environment (`testdata/stageModules.registry.js`). Shared names (e.g. Projects, Equipment Management) reuse one spec; **dev3-only** modules get their own generated specs.

### Environment-scoped test selection

Set **`PACE_ENV=prod`** or **`PACE_ENV=dev3`** before running Playwright. The runner only **executes** tests tagged for that environment:

| Tag | Runs when |
|-----|-----------|
| `@pace-env-prod` | `PACE_ENV=prod` |
| `@pace-env-dev3` | `PACE_ENV=dev3` |
| `@pace-env-all` | both |

Configuration lives in:

- **Modules:** `enabledEnvs` on each entry in `testdata/stageModules.registry.js`
- **Control Tower reports:** `enabledEnvs` (or `prodEnabled: false` → dev3 only) in `testdata/control-tower/*.js`

Regenerate module specs after registry changes: `npm run generate:prod-modules`.

To disable Playwright env filtering (still uses `test.skip` at runtime): `PACE_ENV_FILTER=false`.

## CI

GitHub Actions: `.github/workflows/playwright-ci.yml`  
Jenkins: `Jenkinsfile`

### Design (best practice)

| Layer | Modules (`prod-modules-email`) | Control Tower (`control-tower-reports-email`) |
|-------|----------------------------------|-----------------------------------------------|
| **Local** | Parallel (default 4 workers) | Parallel optional (`--workers=4` in npm scripts) |
| **CI** | Parallel (4 workers), one auth per worker | **Serial**: 1 worker, `fullyParallel: false`, shared CT tab per run |
| **Why** | Specs are isolated per module | Reports share filters/tabs; parallel CT causes flaky retries and session teardown |

CI defaults for Control Tower live in `utils/ciControlTower.js` (timeouts, `PLAYWRIGHT_WORKERS=1`). Local `npm run test:ci:*:control-tower` uses the same values.

### When jobs run (GitHub Actions)

| Trigger | Prod modules | Prod / dev3 Control Tower & dev3 modules |
|---------|--------------|------------------------------------------|
| **Pull request** | Yes | Skipped (fast feedback) unless repo variable `CI_FULL_SUITE=true` |
| **Push** to `main`, `master`, `cursor/**` | Yes | Yes (full suite) |
| **Schedule** (daily 8:00 AM IST) | Yes | Yes |
| **Workflow dispatch** | Per selected suite | Per selected suite |

Set repository variable **`CI_FULL_SUITE=true`** to run the full suite on every PR.

### Environments in CI

Tests run in **separate parallel jobs** per environment (never one mixed `PACE_ENV`):

| Job | `PACE_ENV` | Workers (modules / CT) |
|-----|------------|-------------------------|
| Prod modules | `prod` | 4 / — |
| Prod Control Tower | `prod` | — / **1 (serial)** |
| Dev3 modules | `dev3` | 4 / — |
| Dev3 Control Tower | `dev3` | — / **1 (serial)** |

Profile URLs and project context come from `config/environments.js` after `PACE_ENV` is set.

### GitHub Actions secrets / variables

| Name | Purpose |
|------|---------|
| `TEST_EMAIL`, `TEST_PASSWORD` | Prod login (required) |
| `DEV3_TEST_EMAIL`, `DEV3_TEST_PASSWORD` | Dev3 login (optional; defaults to prod creds if same user works on dev3) |
| `ENABLE_DEV3_CI` | Set to `false` to skip dev3 jobs |
| `CI_FULL_SUITE` | Set to `true` to run Control Tower + dev3 on pull requests |
| `SMTP_PASSWORD` | Email report (optional) |

Install: `npm ci --ignore-scripts` then `npx playwright install --with-deps chromium` (Playwright ≥ 1.61 for Ubuntu 26.04 runners).

Manual run: **Actions → Playwright CI → Run workflow** — suite `all` runs prod + dev3. Use `prod-only`, `dev3-only`, or individual suite names to narrow scope.

Failed jobs upload **`test-results/`** and **`playwright-report/`** (HTML) artifacts.

### Jenkins

Parameters: `TEST_SUITE` (`all`, `prod-only`, `dev3-only`, …) and `RUN_DEV3` (default true). Stages run in **parallel** when selected.

Optional: add Jenkins credentials `pace-dev3-test-email` / `pace-dev3-test-password` and map them to `DEV3_TEST_*` in the job environment if dev3 uses a different account than prod.

### Local CI simulation

```bash
npm run test:ci                    # prod modules + prod CT
npm run test:ci:dev3               # dev3 modules + dev3 CT (PACE_ENV=dev3)
```
