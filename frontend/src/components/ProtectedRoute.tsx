import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  console.log('[ProtectedRoute] Verificando rota:', location.pathname);
  console.log('[ProtectedRoute] isAuthenticated:', isAuthenticated);
  console.log('[ProtectedRoute] currentUser:', currentUser);
  console.log('[ProtectedRoute] requiredRole:', requiredRole);

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Não autenticado, redirecionando para /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    console.log(`[ProtectedRoute] Role mismatch (current: ${currentUser?.role}, required: ${requiredRole}), redirecionando para /dashboard`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('[ProtectedRoute] Acesso permitido, renderizando children.');
  return <>{children}</>;
};

export default ProtectedRoute; 