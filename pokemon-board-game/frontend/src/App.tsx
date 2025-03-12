import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import GameBoard from './components/game/GameBoard';
import StarterSelection from './components/auth/StarterSelection';
import useAuth from './hooks/useAuth';

// Componente de proteção de rota
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireStarter?: boolean;
}> = ({ children, requireStarter = true }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pokemon-black">
        <div className="text-pokemon-yellow text-2xl animate-bounce">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Carregando...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireStarter && !user?.hasStarter) {
    return <Navigate to="/starter-selection" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-pokemon-black">
          <Routes>
            {/* Rotas públicas */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Rotas protegidas */}
            <Route
              path="/starter-selection"
              element={
                <ProtectedRoute requireStarter={false}>
                  <StarterSelection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game"
              element={
                <ProtectedRoute>
                  <GameBoard />
                </ProtectedRoute>
              }
            />

            {/* Redirecionar para login por padrão */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

// Componente para rotas públicas
const PublicRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (!user?.hasStarter) {
      return <Navigate to="/starter-selection" />;
    }
    return <Navigate to="/game" />;
  }

  return <>{children}</>;
};

export default App;
