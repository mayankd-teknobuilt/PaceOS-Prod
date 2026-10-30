pipeline {
    agent any

    tools {
        nodejs 'NodeJS20'
    }

    options {
        timestamps()
        timeout(time: 4, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['all', 'prod-only', 'dev3-only', 'prod-modules', 'control-tower', 'dev3-modules', 'dev3-control-tower', 'fast'],
            description: 'Which Playwright suite to run'
        )
        booleanParam(
            name: 'RUN_DEV3',
            defaultValue: true,
            description: 'Run Dev Company 3 (PACE_ENV=dev3) jobs in parallel with prod'
        )
    }

    environment {
        CI = 'true'
        BASE_URL = credentials('pace-base-url')
        TEST_EMAIL = credentials('pace-test-email')
        TEST_PASSWORD = credentials('pace-test-password')
        PLAYWRIGHT_WORKERS = '4'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm ci --ignore-scripts'
                        sh 'npx playwright install --with-deps chromium'
                    } else {
                        bat 'npm ci --ignore-scripts'
                        bat 'npx playwright install chromium'
                    }
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                script {
                    def runProdModules = ['all', 'prod-only', 'prod-modules', 'fast'].contains(params.TEST_SUITE)
                    def runProdCt = ['all', 'prod-only', 'control-tower', 'fast'].contains(params.TEST_SUITE)
                    def runDev3Modules = params.RUN_DEV3 && ['all', 'dev3-only', 'dev3-modules'].contains(params.TEST_SUITE)
                    def runDev3Ct = params.RUN_DEV3 && ['all', 'dev3-only', 'dev3-control-tower'].contains(params.TEST_SUITE)

                    def branches = [:]

                    if (runProdModules) {
                        branches['Prod modules'] = {
                            stage('Prod modules') {
                                if (isUnix()) {
                                    sh 'node scripts/create-ci-env.js && node scripts/validate-ci-env.js'
                                    sh 'cross-env CI=true PLAYWRIGHT_JSON_OUTPUT=report-prod-modules.json npm run test:ci:prod-modules'
                                } else {
                                    bat 'node scripts\\create-ci-env.js && node scripts\\validate-ci-env.js'
                                    bat 'npm run test:ci:prod-modules'
                                }
                            }
                        }
                    }

                    if (runProdCt) {
                        branches['Prod Control Tower'] = {
                            stage('Prod Control Tower') {
                                if (isUnix()) {
                                    sh 'node scripts/create-ci-env.js && node scripts/validate-ci-env.js'
                                    sh 'cross-env CI=true PLAYWRIGHT_JSON_OUTPUT=report-control-tower.json npm run test:ci:control-tower'
                                } else {
                                    bat 'node scripts\\create-ci-env.js && node scripts\\validate-ci-env.js'
                                    bat 'npm run test:ci:control-tower'
                                }
                            }
                        }
                    }

                    if (runDev3Modules) {
                        branches['Dev3 modules'] = {
                            stage('Dev3 modules') {
                                if (isUnix()) {
                                    sh 'cross-env PACE_ENV=dev3 node scripts/create-ci-env.js && cross-env PACE_ENV=dev3 node scripts/validate-ci-env.js'
                                    sh 'cross-env CI=true PACE_ENV=dev3 PLAYWRIGHT_JSON_OUTPUT=report-dev3-modules.json npm run test:ci:dev3:prod-modules'
                                } else {
                                    bat 'set PACE_ENV=dev3&& node scripts\\create-ci-env.js && set PACE_ENV=dev3&& node scripts\\validate-ci-env.js'
                                    bat 'set PACE_ENV=dev3&& npm run test:ci:dev3:prod-modules'
                                }
                            }
                        }
                    }

                    if (runDev3Ct) {
                        branches['Dev3 Control Tower'] = {
                            stage('Dev3 Control Tower') {
                                if (isUnix()) {
                                    sh 'cross-env PACE_ENV=dev3 node scripts/create-ci-env.js && cross-env PACE_ENV=dev3 node scripts/validate-ci-env.js'
                                    sh 'cross-env CI=true PACE_ENV=dev3 PLAYWRIGHT_JSON_OUTPUT=report-dev3-control-tower.json npm run test:ci:dev3:control-tower'
                                } else {
                                    bat 'set PACE_ENV=dev3&& node scripts\\create-ci-env.js && set PACE_ENV=dev3&& node scripts\\validate-ci-env.js'
                                    bat 'set PACE_ENV=dev3&& npm run test:ci:dev3:control-tower'
                                }
                            }
                        }
                    }

                    if (branches.isEmpty()) {
                        error("No jobs selected for TEST_SUITE=${params.TEST_SUITE}, RUN_DEV3=${params.RUN_DEV3}")
                    }

                    parallel branches
                }
            }
        }
    }

    post {
        always {
            script {
                try {
                    if (isUnix()) {
                        sh 'node scripts/create-ci-env.js'
                        sh 'node scripts/send-test-report-email.js'
                    } else {
                        bat 'node scripts\\create-ci-env.js'
                        bat 'node scripts\\send-test-report-email.js'
                    }
                } catch (err) {
                    echo "Email report skipped or failed: ${err.message}"
                }
            }
            archiveArtifacts artifacts: 'playwright-report/**,test-results/**,allure-results/**', allowEmptyArchive: true
            allure([
                includeProperties: false,
                jdk: '',
                results: [[path: 'allure-results']]
            ])
        }
        failure {
            echo 'Playwright tests failed. Download playwright-report artifact for HTML report.'
        }
    }
}
