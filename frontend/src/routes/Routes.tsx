import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/common/LoginPage';
import { RegisterPage } from '../pages/common/RegisterPage';
import { LandingPage } from '../pages/common/LandingPage';
import { JobsPage } from '../pages/common/JobsPage';
import { ClientProfile } from '../pages/client/ClientProfile'
import { FreelancerProfile } from '../pages/freelancer/FreelancerProfile'
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from '../pages/common/Layout';
import { ClientJobs } from '../pages/client/ClientJobs';
import JobDetailsPage from '../pages/common/JobDetailsPage';
import FreelancerApplications from '../pages/freelancer/FreelancerApplications';
import JobApplicationsPage from '../pages/client/JobApplicationsPage';
import ApplicationDetailsPage from '../pages/client/ApplicationDetailsPage';
import { MessagesPage } from '../pages/common/MessagesPage';
import { MessageProvider } from '../context/MessageContext';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/client-profile",
    element: (
      <ProtectedRoute requiredRole="client">
        <MessageProvider>
          <Layout>
            <ClientProfile />
          </Layout>
        </MessageProvider>
      </ProtectedRoute>
    )
  },
  {
    path: "/freelancer-profile",
    element: (
      <ProtectedRoute requiredRole="freelancer">
        <MessageProvider>
          <Layout>
            <FreelancerProfile />
          </Layout>
        </MessageProvider>
      </ProtectedRoute>
    )
  },
  {
    path: "/jobs",
    element: (
      <ProtectedRoute>
        <MessageProvider>
          <Layout>
            <JobsPage />
          </Layout>
        </MessageProvider>
      </ProtectedRoute>
    )
  },
  {
    path: "/my-jobs",
    element: (
      <ProtectedRoute requiredRole="client">
        <MessageProvider>
          <Layout>
            <ClientJobs />
          </Layout>
        </MessageProvider>
      </ProtectedRoute>
    )
  },
  {
    path: "/jobs/:id",
    element: (
      <ProtectedRoute>
        <MessageProvider>
          <Layout>
            <JobDetailsPage />
          </Layout>
        </MessageProvider>
      </ProtectedRoute>
    )
  },
  {
    path: "/applications/by-job/:id",
    element: (
      <ProtectedRoute requiredRole="client">
        <MessageProvider>
          <Layout>
            <JobApplicationsPage />
          </Layout>
        </MessageProvider>
      </ProtectedRoute>
    )
  },
  {
    path: "/applications/:id",
    element: (
      <ProtectedRoute requiredRole="client">
        <MessageProvider>
          <Layout>
            <ApplicationDetailsPage />
          </Layout>
        </MessageProvider>
      </ProtectedRoute>
    )
  },
  {
    path: "/my-applications",
    element: (
      <ProtectedRoute requiredRole="freelancer">
        <MessageProvider>
          <Layout>
            <FreelancerApplications />
          </Layout>
        </MessageProvider>
      </ProtectedRoute>
    )
  },
  {
    path: "/messages",
    element: (
      <ProtectedRoute>
        <MessageProvider>
          <Layout>
            <MessagesPage />
          </Layout>
        </MessageProvider>
      </ProtectedRoute>
    )
  }
]);

