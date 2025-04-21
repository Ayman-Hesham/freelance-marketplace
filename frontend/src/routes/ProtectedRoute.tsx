import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PulseLoader } from 'react-spinners';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'freelancer';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <PulseLoader color="#4F46E5" size={15} />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'client') {
      return <Navigate to="/client-profile" replace />;
    } else if (user.role === 'freelancer') {
      return <Navigate to="/freelancer-profile" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};