import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um token salvo
    const token = localStorage.getItem('pokemon_token');
    if (token) {
      checkAuth(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async (token) => {
    try {
      const response = await axios.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Erro na verificação de autenticação:', error);
      localStorage.removeItem('pokemon_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { token, user } = response.data;
      localStorage.setItem('pokemon_token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao fazer login'
      };
    }
  };

  const register = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/register', { username, password });
      const { token, user } = response.data;
      localStorage.setItem('pokemon_token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao registrar'
      };
    }
  };

  const selectStarter = async (pokemonId) => {
    try {
      const response = await axios.post('/api/auth/select-starter', 
        { pokemonId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('pokemon_token')}` } }
      );
      setUser(prev => ({ ...prev, hasStarter: true, pokemon: response.data.pokemon }));
      return { success: true };
    } catch (error) {
      console.error('Erro ao selecionar Pokémon inicial:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao selecionar Pokémon inicial'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('pokemon_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    selectStarter
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default useAuth;
