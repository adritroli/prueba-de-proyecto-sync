import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const user = localStorage.getItem('user');

  useEffect(() => {
    // Verificar si hay una sesión válida
    if (!user) {
      localStorage.clear(); // Limpiar cualquier dato residual
    }
  }, [user]);

  if (!user) {
    // Redirigir a login y guardar la ubicación intentada
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    // Verificar que el usuario sea un objeto JSON válido
    JSON.parse(user);
  } catch {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
