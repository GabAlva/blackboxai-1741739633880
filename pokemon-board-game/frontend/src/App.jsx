import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import GameBoard from './components/game/GameBoard';
import StarterSelection from './components/auth/StarterSelection';
import useAuth from './hooks/useAuth';

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-pokemon-black">
        <Routes>
          {/* Rotas públicas */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/game" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/starter-selection" />} 
          />
          <Route 
            path="/starter-selection" 
            element={
              isAuthenticated && !user?.hasStarter 
                ? <StarterSelection /> 
                : <Navigate to="/game" />
            } 
          />

          {/* Rotas protegidas */}
          <Route 
            path="/game" 
            element={
              isAuthenticated && user?.hasStarter 
                ? <GameBoard /> 
                : <Navigate to="/login" />
            } 
          />

          {/* Redirecionar para login por padrão */}
          <Route 
            path="*" 
            element={<Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
