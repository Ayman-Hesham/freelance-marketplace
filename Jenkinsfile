pipeline {
    agent any
    
    environment {
        AWS_REGION = 'ap-southeast-1'
        S3_BUCKET = 'freelance-marketplace-deployments'
        CODEDEPLOY_APP = 'freelance-marketplace'
        CODEDEPLOY_GROUP = 'production'
        GITHUB_REPO = 'https://github.com/Ayman-Hesham/freelance-marketplace'
    }
    
    triggers {
        pollSCM('H/5 * * * *')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT = bat(
                        script: 'git rev-parse HEAD',
                        returnStdout: true
                    ).trim()
                    
                    // Generate clean timestamp without spaces or special characters
                    env.BUILD_TIMESTAMP = bat(
                        script: 'powershell -Command "Get-Date -Format \'yyyyMMdd-HHmmss\'"',
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Package') {
            steps {
                script {
                    def artifactName = "deployment-${env.BUILD_TIMESTAMP}-${env.BUILD_NUMBER}.zip"
                    env.ARTIFACT_NAME = artifactName
            
                    bat """
                        powershell -Command "Compress-Archive -Path '.\\*' -DestinationPath '${artifactName}' -Exclude '*.git*','*.zip','node_modules','*.log' -Force"
                    """
                    
                    // Verify the zip file was created
                    bat "dir ${artifactName}"
                }
            }
        }
        
        stage('Upload to S3') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-credentials']]) {
                    bat """
                        aws s3 cp ${env.ARTIFACT_NAME} s3://${S3_BUCKET}/deployments/
                        aws s3 ls s3://${S3_BUCKET}/deployments/${env.ARTIFACT_NAME}
                    """
                }
            }
        }
        
        stage('Deploy with CodeDeploy') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-credentials']]) {
                    script {
                        // Register application revision
                        bat """
                            aws codedeploy register-application-revision ^
                                --application-name ${CODEDEPLOY_APP} ^
                                --s3-location bucket=${S3_BUCKET},key=deployments/${env.ARTIFACT_NAME},bundleType=zip ^
                                --region ${AWS_REGION}
                        """
                        
                        // Create deployment and capture deployment ID
                        def deploymentId = bat(
                            script: """
                                aws codedeploy create-deployment ^
                                    --application-name ${CODEDEPLOY_APP} ^
                                    --deployment-group-name ${CODEDEPLOY_GROUP} ^
                                    --s3-location bucket=${S3_BUCKET},key=deployments/${env.ARTIFACT_NAME},bundleType=zip ^
                                    --region ${AWS_REGION} ^
                                    --description "Deployment from Jenkins build ${BUILD_NUMBER}" ^
                                    --query deploymentId ^
                                    --output text
                            """,
                            returnStdout: true
                        ).trim()
                        
                        echo "Deployment ID: ${deploymentId}"
                        
                        // Wait for deployment
                        bat """
                            aws codedeploy wait deployment-successful ^
                                --deployment-id ${deploymentId} ^
                                --region ${AWS_REGION}
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            bat 'if exist *.zip del /q *.zip'
        }
        success {
            echo "Pipeline completed successfully!"
            echo "Deployed artifact: ${env.ARTIFACT_NAME}"
        }
        failure {
            echo "Pipeline failed. Check the logs above for details."
        }
    }
}
