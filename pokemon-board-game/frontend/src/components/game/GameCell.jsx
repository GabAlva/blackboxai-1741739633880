import React from 'react';

const GameCell = ({ index, cell, players }) => {
  // Determinar o tipo de célula (normal, ginásio, elite4)
  const isGymLeader = cell?.type === 'gym';
  const isEliteFour = cell?.type === 'elite4';

  // Função para renderizar os jogadores na célula
  const renderPlayers = () => {
    return players.map((player, idx) => (
      <div
        key={player.id}
        className={`absolute w-4 h-4 rounded-full border-2 border-white ${
          player.isCurrentPlayer ? 'animate-pulse' : ''
        }`}
        style={{
          backgroundColor: getPlayerColor(idx),
          top: `${8 + (idx * 8)}px`,
          left: `${8 + (idx * 8)}px`,
        }}
      ></div>
    ));
  };

  // Função para obter a cor do jogador
  const getPlayerColor = (index) => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
    return colors[index] || colors[0];
  };

  // Função para renderizar o ícone da célula
  const renderCellIcon = () => {
    if (isGymLeader) {
      return (
        <div className="text-pokemon-gold">
          <i className="fas fa-medal"></i>
        </div>
      );
    }
    if (isEliteFour) {
      return (
        <div className="text-pokemon-red">
          <i className="fas fa-crown"></i>
        </div>
      );
    }
    return (
      <div className="text-white opacity-20">
        <i className="fas fa-circle"></i>
      </div>
    );
  };

  return (
    <div
      className={`pokemon-cell relative ${
        isGymLeader
          ? 'bg-pokemon-gold bg-opacity-20'
          : isEliteFour
          ? 'bg-pokemon-red bg-opacity-20'
          : ''
      }`}
    >
      {/* Número da célula */}
      <div className="absolute top-1 left-1 text-xs opacity-50">
        {index + 1}
      </div>

      {/* Ícone central */}
      <div className="text-xl">
        {renderCellIcon()}
      </div>

      {/* Jogadores */}
      <div className="relative w-full h-full">
        {renderPlayers()}
      </div>

      {/* Informação da célula */}
      {(isGymLeader || isEliteFour) && (
        <div className="absolute bottom-1 right-1 text-xs">
          {cell.name}
        </div>
      )}

      {/* Efeito de hover */}
      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-200"></div>
    </div>
  );
};

export default GameCell;
