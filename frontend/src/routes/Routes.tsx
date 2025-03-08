import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { LandingPage } from '../pages/LandingPage';
import { ClientProfile } from '../pages/client/ClientProfile'
import { FreelancerProfile } from '../pages/freelancer/FreelancerProfile'

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
    element: <ClientProfile />
  },
  {
    path: "/freelancer-profile",
    element: <FreelancerProfile />
  }
]);

