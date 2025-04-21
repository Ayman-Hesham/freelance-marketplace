import { RouterProvider } from 'react-router-dom';
import { router } from './routes/Routes';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PulseLoader } from 'react-spinners';

function App() {
  return (
    <AuthProvider>
      <AuthInit>
        <RouterProvider router={router} />
      </AuthInit>
    </AuthProvider>
  );
}

function AuthInit({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useAuth();
  
  if (!isInitialized) {
    return <PulseLoader color="#36d7b7" />;
  }

  return <>{children}</>;
}

export default App;