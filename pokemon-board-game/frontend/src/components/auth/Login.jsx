import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/game');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pokemon-black p-4">
      <div className="pokemon-card w-full max-w-md">
        <h1 className="pokemon-title text-3xl mb-8">
          Pokémon Board Game
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block pokemon-text mb-2">
              Nome de Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pokemon-input w-full"
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block pokemon-text mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pokemon-input w-full"
              placeholder="Digite sua senha"
              required
            />
          </div>

          {error && (
            <div className="text-pokemon-red text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`pokemon-button w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Carregando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>

          <div className="text-center mt-4">
            <Link 
              to="/register" 
              className="text-pokemon-yellow hover:text-pokemon-gold transition-colors"
            >
              Não tem uma conta? Registre-se
            </Link>
          </div>
        </form>

        {/* Decoração */}
        <div className="absolute top-4 left-4 animate-float">
          <i className="fas fa-pokeball text-pokemon-red text-2xl"></i>
        </div>
        <div className="absolute bottom-4 right-4 animate-float" style={{ animationDelay: '1s' }}>
          <i className="fas fa-pokeball text-pokemon-blue text-2xl"></i>
        </div>
      </div>
    </div>
  );
};

export default Login;
