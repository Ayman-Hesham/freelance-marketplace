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

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- MongoDB Atlas account
- AWS account with S3 bucket
- Google AI API key (Gemini)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_s3_bucket_name

# Google AI
GEMINI_API_KEY=your_gemini_api_key

# Application
DATABASE_URL=your_mongodb_connection_string
```

### Installation & Development

#### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd freelance-marketplace
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:5000

#### Option 2: Local Development

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start Backend Development Server**
   ```bash
   cd backend
   npm run dev
   ```

4. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

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
├── docker-compose.yml # Multi-container Docker setup
├── deploy.sh # Deployment script
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

## 🚢 Deployment

### Production Deployment

1. **Set up your server** with Docker and Docker Compose

2. **Configure environment variables** in your `.env` file

3. **Set up SSL certificates** in the `ssl/` directory

4. **Run the deployment script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

5. **Set up backup cron job** (optional)
   ```bash
   chmod +x backup.sh
   # Add to crontab for automated backups
   ```

### Docker Services

The application runs with the following services:
- **Frontend**: Nginx server serving React app (ports 80, 443)
- **Backend**: Node.js API server (internal port 5000)
- **Volumes**: Persistent storage for uploads and logs

## 🛠️ Development

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

**Frontend:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### API Endpoints

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Jobs**: `/api/jobs/*`
- **Applications**: `/api/applications/*`
- **Messages**: `/api/messages/*`
- **Conversations**: `/api/conversations/*`

## 🔧 Configuration

### MongoDB Setup
The application uses MongoDB Atlas. Ensure your connection string includes:
- Database name
- Proper authentication credentials
- Network access configuration

### AWS S3 Setup
Configure S3 bucket with:
- Public read access for portfolio files
- CORS configuration for frontend uploads
- Proper IAM permissions

### Google AI Setup
Obtain Gemini API key from Google AI Studio and ensure:
- API is enabled for your project
- Proper quotas and billing setup
