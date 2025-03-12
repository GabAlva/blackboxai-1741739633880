import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const result = await register(username, password);
      if (result.success) {
        navigate('/starter-selection');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pokemon-black p-4">
      <div className="pokemon-card w-full max-w-md relative overflow-hidden">
        <h1 className="pokemon-title text-3xl mb-8">
          Criar Nova Conta
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
              placeholder="Escolha seu nome de usuário"
              required
              minLength={3}
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
              placeholder="Escolha sua senha"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block pokemon-text mb-2">
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pokemon-input w-full"
              placeholder="Digite sua senha novamente"
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
                Criando conta...
              </span>
            ) : (
              'Criar Conta'
            )}
          </button>

          <div className="text-center mt-4">
            <Link 
              to="/login" 
              className="text-pokemon-yellow hover:text-pokemon-gold transition-colors"
            >
              Já tem uma conta? Faça login
            </Link>
          </div>
        </form>

        {/* Decoração */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-pokemon-red rounded-full opacity-20"></div>
        <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-pokemon-blue rounded-full opacity-20"></div>
        
        <div className="absolute top-4 right-4 animate-float">
          <i className="fas fa-pokeball text-pokemon-yellow text-2xl"></i>
        </div>
        <div className="absolute bottom-4 left-4 animate-float" style={{ animationDelay: '0.5s' }}>
          <i className="fas fa-pokeball text-pokemon-gold text-2xl"></i>
        </div>
      </div>

      {/* Dicas de senha */}
      <div className="fixed bottom-4 left-4 text-pokemon-yellow text-xs">
        <ul className="space-y-1">
          <li><i className="fas fa-info-circle mr-2"></i>Mínimo de 6 caracteres</li>
          <li><i className="fas fa-info-circle mr-2"></i>As senhas devem coincidir</li>
        </ul>
      </div>
    </div>
  );
};

export default Register;
