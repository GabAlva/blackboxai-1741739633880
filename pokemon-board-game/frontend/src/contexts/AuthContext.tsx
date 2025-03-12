import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, SocketService } from '../services/api';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  selectStarter: (pokemonId: number) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('pokemon_token');
      if (!token) {
        setState({ user: null, loading: false, isAuthenticated: false });
        return;
      }

      const response = await authService.verifyToken();
      if (response.data) {
        setState({
          user: response.data,
          loading: false,
          isAuthenticated: true,
        });
        SocketService.connect(token);
      }
    } catch (error) {
      console.error('Erro na verificação de autenticação:', error);
      localStorage.removeItem('pokemon_token');
      setState({ user: null, loading: false, isAuthenticated: false });
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });
      const { token, user } = response.data;
      
      localStorage.setItem('pokemon_token', token);
      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });
      
      SocketService.connect(token);
      return { success: true };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao fazer login',
      };
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await authService.register({ username, password });
      const { token, user } = response.data;
      
      localStorage.setItem('pokemon_token', token);
      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });
      
      SocketService.connect(token);
      return { success: true };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao registrar',
      };
    }
  };

  const selectStarter = async (pokemonId: number) => {
    try {
      const response = await authService.selectStarter(pokemonId);
      setState((prev) => ({
        ...prev,
        user: {
          ...prev.user!,
          hasStarter: true,
          pokemon: response.data.pokemon,
        } as User,
      }));
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao selecionar Pokémon inicial:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao selecionar Pokémon inicial',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('pokemon_token');
    SocketService.disconnect();
    setState({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    selectStarter,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;
