pipeline {
    agent any

    tools {
        nodejs "NodeJS18"
    }

    environment {
        CI = 'true'
    }

    stages {

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                bat 'npx playwright install'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npx playwright test'
            }
        }
    }

post {
    always {
        archiveArtifacts artifacts: 'playwright-report/**, test-results/**', allowEmptyArchive: true
        allure([
            includeProperties: false,
            jdk: '',
            results: [[path: 'allure-results']]
        ])
    }
}

}
