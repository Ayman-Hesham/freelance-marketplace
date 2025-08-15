pipeline {
    agent any
    
    environment {
        AWS_REGION = 'us-east-1'
        S3_BUCKET = 'your-app-deployment-bucket'
        CODEDEPLOY_APP = 'your-app-name'
        CODEDEPLOY_GROUP = 'production'
        GITHUB_REPO = 'your-username/your-repo'
    }
    
    triggers {
        pollSCM('H/5 * * * *') 
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT = sh(
                        script: 'git rev-parse HEAD',
                        returnStdout: true
                    ).trim()
                    env.BUILD_TIMESTAMP = sh(
                        script: 'date +%Y%m%d-%H%M%S',
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
                    
                    sh """
                        zip -r ${artifactName} . \\
                            -x "*.git*" \\
                            -x "*.zip" \\
                            -x "node_modules/*" \\
                            -x "*.log"
                    """
                }
            }
        }
        
        stage('Upload to S3') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-credentials']]) {
                    sh """
                        aws s3 cp ${env.ARTIFACT_NAME} s3://${S3_BUCKET}/deployments/
                        aws s3 ls s3://${S3_BUCKET}/deployments/${env.ARTIFACT_NAME}
                    """
                }
            }
        }
        
        stage('Deploy with CodeDeploy') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-credentials']]) {
                    sh """
                        # Register application revision
                        aws codedeploy register-application-revision \\
                            --application-name ${CODEDEPLOY_APP} \\
                            --s3-location bucket=${S3_BUCKET},key=deployments/${env.ARTIFACT_NAME},bundleType=zip \\
                            --region ${AWS_REGION}
                        
                        # Create deployment
                        DEPLOYMENT_ID=\$(aws codedeploy create-deployment \\
                            --application-name ${CODEDEPLOY_APP} \\
                            --deployment-group-name ${CODEDEPLOY_GROUP} \\
                            --s3-location bucket=${S3_BUCKET},key=deployments/${env.ARTIFACT_NAME},bundleType=zip \\
                            --region ${AWS_REGION} \\
                            --description "Deployment from Jenkins build ${BUILD_NUMBER}" \\
                            --query 'deploymentId' \\
                            --output text)
                        
                        echo "Deployment ID: \$DEPLOYMENT_ID"
                        
                        # Wait for deployment
                        aws codedeploy wait deployment-successful \\
                            --deployment-id \$DEPLOYMENT_ID \\
                            --region ${AWS_REGION}
                    """
                }
            }
        }
    }
    
    post {
        always {
            sh 'rm -f *.zip'
        }
    }
}
