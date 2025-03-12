import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';

const StarterSelection = () => {
  const [starters, setStarters] = useState({});
  const [selectedRegion, setSelectedRegion] = useState('kanto');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { selectStarter } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStarters();
  }, []);

  const fetchStarters = async () => {
    try {
      const response = await axios.get('/api/auth/starters');
      setStarters(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar Pokémon iniciais');
      setLoading(false);
    }
  };

  const handleSelectPokemon = async (pokemon) => {
    setSelectedPokemon(pokemon);
  };

  const handleConfirmSelection = async () => {
    if (!selectedPokemon) return;

    try {
      setLoading(true);
      const result = await selectStarter(selectedPokemon.id);
      if (result.success) {
        navigate('/game');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao selecionar Pokémon inicial');
    } finally {
      setLoading(false);
    }
  };

  const regions = {
    kanto: 'Kanto',
    johto: 'Johto',
    hoenn: 'Hoenn',
    sinnoh: 'Sinnoh',
    unova: 'Unova',
    kalos: 'Kalos',
    alola: 'Alola',
    galar: 'Galar'
  };

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

  return (
    <div className="min-h-screen bg-pokemon-black p-4">
      <div className="pokemon-container">
        <h1 className="pokemon-title text-4xl mb-8">
          Escolha seu Pokémon Inicial
        </h1>

        {/* Seleção de Região */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {Object.entries(regions).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setSelectedRegion(key)}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                selectedRegion === key
                  ? 'bg-pokemon-red text-white'
                  : 'bg-white bg-opacity-10 text-pokemon-yellow hover:bg-opacity-20'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Grid de Pokémon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {starters[selectedRegion]?.map((pokemon) => (
            <div
              key={pokemon.id}
              onClick={() => handleSelectPokemon(pokemon)}
              className={`pokemon-card cursor-pointer ${
                selectedPokemon?.id === pokemon.id
                  ? 'border-pokemon-red'
                  : 'hover:border-pokemon-gold'
              }`}
            >
              <div className="relative">
                <img
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  className="w-32 h-32 mx-auto mb-4 animate-float"
                />
                {selectedPokemon?.id === pokemon.id && (
                  <div className="absolute top-0 right-0">
                    <i className="fas fa-check-circle text-pokemon-red text-2xl"></i>
                  </div>
                )}
              </div>

              <h3 className="pokemon-subtitle capitalize">
                {pokemon.name}
              </h3>

              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 rounded-full text-xs bg-white bg-opacity-20 capitalize"
                  >
                    {type}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                {pokemon.stats.map((stat) => (
                  <div key={stat.name} className="pokemon-stats">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize">{stat.name.replace('-', ' ')}</span>
                      <span>{stat.base}</span>
                    </div>
                    <div className="pokemon-stat-bar">
                      <div
                        className="pokemon-stat-fill"
                        style={{ width: `${(stat.base / 255) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="text-pokemon-red text-center mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleConfirmSelection}
            disabled={!selectedPokemon || loading}
            className={`pokemon-button ${
              !selectedPokemon || loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Selecionando...
              </span>
            ) : (
              <>
                <i className="fas fa-pokeball mr-2"></i>
                Confirmar Escolha
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StarterSelection;
