import React from 'react';
import useAuth from '../../hooks/useAuth';

const PlayerInfo = ({ player, isCurrentPlayer }) => {
  const { user } = useAuth();
  const isCurrentUser = user.id === player.id;

  const renderPokemonList = () => {
    return player.pokemons.map((pokemon) => (
      <div
        key={pokemon.id}
        className={`pokemon-card p-2 ${
          pokemon.id === player.currentPokemonId
            ? 'border-pokemon-red'
            : 'border-transparent'
        }`}
      >
        <div className="flex items-center space-x-2">
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className={`w-10 h-10 ${pokemon.isShiny ? 'animate-pulse' : ''}`}
          />
          <div className="flex-1">
            <div className="flex items-center">
              <span className="text-xs capitalize">{pokemon.name}</span>
              {pokemon.isShiny && (
                <span className="text-pokemon-gold ml-1">
                  <i className="fas fa-star text-xs"></i>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs">Nv. {pokemon.level}</span>
              {pokemon.id === player.currentPokemonId && (
                <span className="text-pokemon-red text-xs">
                  <i className="fas fa-circle"></i>
                </span>
              )}
            </div>
          </div>

          {/* Barra de HP */}
          <div className="w-20">
            <div className="pokemon-stats">
              <div className="flex justify-between text-xs mb-1">
                <span>HP</span>
                <span>{pokemon.currentHp}/{pokemon.maxHp}</span>
              </div>
              <div className="pokemon-stat-bar h-1">
                <div
                  className="pokemon-stat-fill"
                  style={{
                    width: `${(pokemon.currentHp / pokemon.maxHp) * 100}%`,
                    backgroundColor: pokemon.currentHp < pokemon.maxHp * 0.2
                      ? '#ff0000'
                      : pokemon.currentHp < pokemon.maxHp * 0.5
                      ? '#ffff00'
                      : '#00ff00'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div
      className={`pokemon-card ${
        isCurrentPlayer
          ? 'border-pokemon-red'
          : isCurrentUser
          ? 'border-pokemon-yellow'
          : ''
      }`}
    >
      {/* Cabeçalho do Jogador */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isCurrentPlayer ? 'bg-pokemon-red animate-pulse' : 'bg-gray-500'
            }`}
          ></div>
          <h3 className={`pokemon-subtitle text-sm ${
            isCurrentUser ? 'text-pokemon-yellow' : ''
          }`}>
            {player.username}
            {isCurrentUser && ' (Você)'}
          </h3>
        </div>
        <div className="text-xs">
          <i className="fas fa-trophy mr-1"></i>
          {player.gymsDefeated}/6
        </div>
      </div>

      {/* Progresso */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Posição</span>
          <span>{player.position}/40</span>
        </div>
        <div className="pokemon-stat-bar">
          <div
            className="pokemon-stat-fill"
            style={{ width: `${(player.position / 40) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Lista de Pokémon */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {renderPokemonList()}
      </div>

      {/* Status do Jogador */}
      <div className="mt-4 flex justify-between text-xs">
        <div>
          <i className="fas fa-medal mr-1"></i>
          {player.badges} Insígnias
        </div>
        <div>
          <i className="fas fa-pokeball mr-1"></i>
          {player.pokemons.length} Pokémon
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
