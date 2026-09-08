pipeline {
    agent any

    tools {
        nodejs 'NodeJS20'
    }

    options {
        timestamps()
        timeout(time: 3, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['all', 'prod-modules', 'control-tower', 'fast'],
            description: 'Which Playwright suite to run'
        )
    }

    environment {
        CI = 'true'
        BASE_URL = credentials('pace-base-url')
        TEST_EMAIL = credentials('pace-test-email')
        TEST_PASSWORD = credentials('pace-test-password')
        PROD_USE_FIRST_PROJECT = 'true'
        PLAYWRIGHT_WORKERS = '4'
        CT_WORKERS = '4'
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
                        sh 'npm ci'
                        sh 'npx playwright install --with-deps chromium'
                    } else {
                        bat 'npm ci'
                        bat 'npx playwright install chromium'
                    }
                }
            }
        }

        stage('Validate Environment') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'node scripts/validate-ci-env.js'
                    } else {
                        bat 'node scripts/validate-ci-env.js'
                    }
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                script {
                    def command = 'npm run test:ci'
                    if (params.TEST_SUITE == 'prod-modules') {
                        command = 'npm run test:ci:prod-modules'
                    } else if (params.TEST_SUITE == 'control-tower') {
                        command = 'npm run test:ci:control-tower'
                    } else if (params.TEST_SUITE == 'fast') {
                        command = 'npm run test:ci:fast'
                    }

                    if (isUnix()) {
                        sh command
                    } else {
                        bat command
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                try {
                    if (isUnix()) {
                        sh 'node scripts/send-test-report-email.js'
                    } else {
                        bat 'node scripts/send-test-report-email.js'
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
