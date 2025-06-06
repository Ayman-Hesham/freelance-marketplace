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
        <Layout>
          <ClientProfile />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/freelancer-profile",
    element: (
      <ProtectedRoute requiredRole="freelancer">
        <Layout>
          <FreelancerProfile />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/my-jobs",
    element: (
      <ProtectedRoute requiredRole="client">
        <Layout>
          <ClientJobs />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/jobs",
    element: (
      <ProtectedRoute>
        <Layout>
          <JobsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/jobs/:id",
    element: (
      <ProtectedRoute>
        <Layout>
          <JobDetailsPage />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/applications/by-job/:id",
    element: (
      <ProtectedRoute requiredRole="client">
        <Layout>
          <JobApplicationsPage />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/applications/:id",
    element: (
      <ProtectedRoute requiredRole="client">
        <Layout>
          <ApplicationDetailsPage />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/my-applications",
    element: (
      <ProtectedRoute requiredRole="freelancer">
        <Layout>
          <FreelancerApplications />
        </Layout>
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

