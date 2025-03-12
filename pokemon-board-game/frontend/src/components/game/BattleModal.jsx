import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BattleModal = ({ battleData, onBattleEnd, userPokemon }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedMove, setSelectedMove] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFlee();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addToBattleLog = (message) => {
    setBattleLog((prev) => [...prev, message]);
  };

  const handleAttack = async (move) => {
    setLoading(true);
    setSelectedMove(move);

    try {
      const response = await axios.post('/api/game/battle/attack', {
        userPokemonId: userPokemon.id,
        targetPokemonId: battleData.pokemon.id,
        moveId: move.id
      });

      const { damage, effectiveness, critical } = response.data;

      // Adicionar mensagens ao log de batalha
      addToBattleLog(`${userPokemon.name} usou ${move.name}!`);
      
      if (critical) {
        addToBattleLog('Acerto crítico!');
      }
      
      if (effectiveness > 1) {
        addToBattleLog('É super efetivo!');
      } else if (effectiveness < 1) {
        addToBattleLog('Não é muito efetivo...');
      }

      addToBattleLog(`Causou ${damage} de dano!`);

      if (response.data.targetDefeated) {
        addToBattleLog(`${battleData.pokemon.name} foi derrotado!`);
        setTimeout(() => {
          onBattleEnd({ 
            result: 'victory', 
            experienceGained: response.data.experienceGained 
          });
        }, 2000);
      }
    } catch (error) {
      addToBattleLog('Erro ao executar o ataque!');
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    setCapturing(true);
    addToBattleLog('Tentando capturar...');

    try {
      const response = await axios.post('/api/game/battle/capture', {
        userPokemonId: userPokemon.id,
        targetPokemonId: battleData.pokemon.id
      });

      if (response.data.success) {
        addToBattleLog('Pokémon capturado com sucesso!');
        setTimeout(() => {
          onBattleEnd({ 
            result: 'capture', 
            capturedPokemon: response.data.pokemon 
          });
        }, 2000);
      } else {
        addToBattleLog('O Pokémon escapou!');
        setCapturing(false);
      }
    } catch (error) {
      addToBattleLog('Erro ao tentar capturar!');
      setCapturing(false);
    }
  };

  const handleFlee = () => {
    addToBattleLog('Fugindo da batalha...');
    setTimeout(() => {
      onBattleEnd({ result: 'flee' });
    }, 1000);
  };

  return (
    <div className="pokemon-battle-modal">
      <div className="pokemon-card max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="pokemon-title">Batalha Pokémon!</h2>
          <div className="text-pokemon-red font-bold">
            Tempo: {timeLeft}s
          </div>
        </div>

        {/* Arena de Batalha */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Pokémon do Usuário */}
          <div className="text-center">
            <img
              src={userPokemon.sprite}
              alt={userPokemon.name}
              className="w-40 h-40 mx-auto mb-4 animate-float"
            />
            <h3 className="pokemon-subtitle capitalize">{userPokemon.name}</h3>
            <div className="pokemon-stats mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>HP</span>
                <span>{userPokemon.currentHp}/{userPokemon.maxHp}</span>
              </div>
              <div className="pokemon-stat-bar">
                <div
                  className="pokemon-stat-fill"
                  style={{
                    width: `${(userPokemon.currentHp / userPokemon.maxHp) * 100}%`,
                    backgroundColor: userPokemon.currentHp < userPokemon.maxHp * 0.2
                      ? '#ff0000'
                      : userPokemon.currentHp < userPokemon.maxHp * 0.5
                      ? '#ffff00'
                      : '#00ff00'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Pokémon Selvagem/Oponente */}
          <div className="text-center">
            <img
              src={battleData.pokemon.sprite}
              alt={battleData.pokemon.name}
              className={`w-40 h-40 mx-auto mb-4 ${
                battleData.pokemon.isShiny ? 'animate-pulse' : 'animate-float'
              }`}
            />
            <h3 className="pokemon-subtitle capitalize">
              {battleData.pokemon.name}
              {battleData.pokemon.isShiny && (
                <span className="text-pokemon-gold ml-2">
                  <i className="fas fa-star"></i>
                </span>
              )}
            </h3>
            <div className="flex justify-center gap-2 mt-2">
              {battleData.pokemon.types.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 rounded-full text-xs bg-white bg-opacity-20 capitalize"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Log de Batalha */}
        <div className="bg-black bg-opacity-50 rounded-lg p-4 mb-6 h-32 overflow-y-auto">
          {battleLog.map((log, index) => (
            <p key={index} className="text-sm mb-1">
              {log}
            </p>
          ))}
        </div>

        {/* Ações */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="pokemon-subtitle text-sm mb-2">Movimentos</h4>
            <div className="grid grid-cols-2 gap-2">
              {userPokemon.moves.map((move) => (
                <button
                  key={move.id}
                  onClick={() => handleAttack(move)}
                  disabled={loading || capturing}
                  className={`pokemon-button text-xs ${
                    selectedMove?.id === move.id ? 'bg-pokemon-blue' : ''
                  }`}
                >
                  {move.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="pokemon-subtitle text-sm mb-2">Outras Ações</h4>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={handleCapture}
                disabled={loading || capturing || battleData.type === 'trainer'}
                className="pokemon-button bg-pokemon-blue"
              >
                {capturing ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fas fa-pokeball mr-2"></i>
                    Capturar
                  </>
                )}
              </button>
              <button
                onClick={handleFlee}
                disabled={loading || capturing || battleData.type === 'trainer'}
                className="pokemon-button bg-pokemon-red"
              >
                <i className="fas fa-running mr-2"></i>
                Fugir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleModal;
