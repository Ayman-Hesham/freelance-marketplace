import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { LandingPage } from '../pages/LandingPage';
import { JobsPage } from '../pages/JobsPage';
import { ClientProfile } from '../pages/client/ClientProfile'
import { FreelancerProfile } from '../pages/freelancer/FreelancerProfile'
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from '../pages/Layout';
import { ClientJobs } from '../pages/client/clientJobs';

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
    )
  }
]);

