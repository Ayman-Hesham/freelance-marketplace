# Freelance Marketplace

A modern, full-stack freelance marketplace platform that connects clients with talented freelancers. Built with React, Node.js, and powered by AI for intelligent application ranking.

## 🌟 Overview

Freelance Marketplace is a comprehensive platform designed to streamline the process of hiring freelancers and finding freelance work. It provides a seamless experience for both clients posting jobs and freelancers looking for opportunities.

### Key Features

- **🔐 User Authentication & Profiles**: Secure registration and login for clients, freelancers, and admins
- **💼 Job Management**: Complete job posting, browsing, and application workflow
- **🤖 AI-Powered Matching**: Intelligent application ranking using Google Gemini AI
- **💬 Real-time Messaging**: Instant communication between clients and freelancers
- **📁 File Management**: Secure file uploads and portfolio sharing via AWS S3
- **📊 Project Workflow**: Comprehensive job status tracking from posting to completion
- **👤 User Profiles**: Rich profiles with avatars, bio, portfolio links, and sentiment tracking
- **🛡️ Admin Controls**: Administrative features for platform moderation
- **🚀 Automated CI/CD**: Continuous integration and deployment with Jenkins and AWS CodeDeploy

### User Types

- **Clients**: Post jobs, review applications, hire freelancers, manage projects
- **Freelancers**: Browse jobs, submit applications, communicate with clients, deliver work
- **Admins**: Platform moderation and job management

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with **TypeScript** for type-safe development
- **Tailwind CSS** for styling with **Radix UI** components
- **React Router** for navigation
- **TanStack Query** for server state management
- **Socket.io Client** for real-time features
- **React Hook Form** for form management

### Backend Stack
- **Node.js** with **Express.js** and **TypeScript**
- **MongoDB** with **Mongoose** ODM
- **Socket.io** for real-time messaging
- **JWT** authentication with **bcrypt** for password hashing
- **AWS S3** for file storage
- **Google Gemini AI** for intelligent application ranking
- **Sharp** for image processing

### Infrastructure
- **Docker** containers for easy deployment
- **Nginx** reverse proxy with SSL support
- **MongoDB Atlas** for database hosting
- **AWS S3** for file storage
- **AWS EC2** for application hosting
- **AWS CodeDeploy** for automated deployment orchestration
- **Jenkins** for continuous integration and build automation
- **IAM Roles** for secure AWS service authentication

### CI/CD Pipeline
- **Source Control**: GitHub with webhook integration
- **Build Server**: Jenkins
- **Artifact Storage**: AWS S3 for deployment packages
- **Deployment**: AWS CodeDeploy with automated rollback capabilities

## 📁 Project Structure
```bash
freelance-marketplace/
├── backend/ # Node.js Express API
│ ├── src/
│ │ ├── configs/ # Database and other configurations
│ │ ├── controllers/ # Route controllers
│ │ ├── middleware/ # Custom middleware
│ │ ├── models/ # MongoDB models
│ │ ├── routes/ # API routes
│ │ ├── services/ # Business logic services
│ │ └── types/ # TypeScript type definitions
│ ├── uploads/ # File upload directory
│ └── Dockerfile # Backend container configuration
├── frontend/ # React application
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Page components
│ │ ├── hooks/ # Custom React hooks
│ │ ├── services/ # API service functions
│ │ ├── context/ # React context providers
│ │ ├── types/ # TypeScript interfaces
│ │ └── utils/ # Utility functions
│ ├── nginx.conf # Nginx configuration
│ └── Dockerfile # Frontend container configuration
├── scripts/ # CI/CD deployment scripts
│ ├── install_dependencies.sh # Install system dependencies
│ ├── stop_server.sh # Stop application services
│ ├── start_server.sh # Start application services
│ └── validate_service.sh # Post-deployment validation
├── appspec.yml # AWS CodeDeploy configuration
├── Jenkinsfile # Jenkins pipeline configuration
├── docker-compose.yml # Multi-container Docker setup
├── deploy.sh # Manual deployment script (legacy)
└── backup.sh # Database backup script
```
## 🔥 Key Features Deep Dive

### Job Workflow
1. **Job Posting**: Clients create detailed job listings with budget and timeline
2. **Application Process**: Freelancers submit applications with cover letters and portfolios
3. **AI Ranking**: Applications are automatically ranked using Google Gemini AI
4. **Selection**: Clients review ranked applications and select freelancers
5. **Project Execution**: Real-time communication and work delivery
6. **Completion**: Review, approval, and project completion workflow

### Real-time Messaging
- Instant messaging between clients and freelancers
- Message history and conversation management
- Unread message notifications
- Socket.io powered real-time updates

### AI-Powered Application Ranking
- Automated analysis of cover letters against job requirements
- Intelligent ranking based on technical skills, experience, and relevance
- Google Gemini AI integration for natural language processing

### File Management
- Secure file uploads for portfolios and work deliverables
- AWS S3 integration for scalable storage
- Image optimization with Sharp
- Presigned URLs for secure file access

## 🚀 CI/CD Pipeline

### Pipeline Architecture
The CI/CD pipeline follows a modern DevOps approach with the following flow:

1. **Code Commit** → GitHub repository
2. **Webhook Trigger** → Jenkins pipeline activation
3. **Build & Test** → Automated testing and artifact creation
4. **Package** → Application bundled with deployment scripts
5. **Deploy** → AWS CodeDeploy orchestrates deployment to EC2
6. **Validate** → Automated service validation and health checks

### Pipeline Configuration
**Github Integration**
```bash
triggers {
    pollSCM('H/5 * * * *') // Check for changes every 5 minutes
}
```
### Jenkins Pipeline Stages
1. **Checkout**: Pull latest code from GitHub
2. **Validate**: Check required files and configurations
3. **Package**: Create deployment artifact with all necessary files
4. **Upload**: Store artifact in S3 for CodeDeploy
5. **Deploy**: Trigger CodeDeploy for zero-downtime deployment
6. **Verify**: Validate deployment success and application health

### Deployment Scripts
The application includes the following deployment automation scripts:
- **appspec.yml**: CodeDeploy configuration defining deployment lifecycle
- **scripts/install_dependencies.sh**: Install Docker, Docker Compose, and system dependencies
- **scripts/stop_server.sh**: Gracefully stop existing application containers
- **scripts/start_server.sh**: Build and start application with health checks
- **scripts/validate_service.sh**: Post-deployment validation and testing
