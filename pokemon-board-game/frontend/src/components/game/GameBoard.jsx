import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import io from 'socket.io-client';
import BattleModal from './BattleModal';
import PlayerInfo from './PlayerInfo';
import DiceRoll from './DiceRoll';
import GameCell from './GameCell';

const TOTAL_CELLS = 40;
const SOCKET_URL = 'http://localhost:3001';

const GameBoard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    players: [],
    currentPlayer: null,
    gameStatus: 'waiting',
    board: Array(TOTAL_CELLS).fill(null)
  });
  const [showBattle, setShowBattle] = useState(false);
  const [battleData, setBattleData] = useState(null);
  const [showDice, setShowDice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Conectado ao servidor');
    });

    newSocket.on('gameState', (state) => {
      setGameState(state);
    });

    newSocket.on('battleStart', (data) => {
      setBattleData(data);
      setShowBattle(true);
    });

    newSocket.on('playerMoved', (data) => {
      updatePlayerPosition(data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      joinGame();
    }
  }, [socket]);

  const joinGame = async () => {
    try {
      const response = await axios.post('/api/game/join', {
        userId: user.id
      });

      if (response.data.gameId) {
        socket.emit('joinGame', response.data.gameId);
      }

      setLoading(false);
    } catch (err) {
      setError('Erro ao entrar no jogo');
      setLoading(false);
    }
  };

  const handleRollDice = async () => {
    if (gameState.currentPlayer !== user.id) return;

    try {
      setShowDice(true);
      const response = await axios.post('/api/game/roll', {
        userId: user.id,
        gameId: gameState.gameId
      });

      socket.emit('playerRolled', {
        gameId: gameState.gameId,
        roll: response.data.diceRoll,
        newPosition: response.data.newPosition
      });

      if (response.data.encounter) {
        setBattleData(response.data.encounter);
        setShowBattle(true);
      }
    } catch (err) {
      setError('Erro ao rolar o dado');
    } finally {
      setTimeout(() => setShowDice(false), 2000);
    }
  };

  const updatePlayerPosition = (data) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id === data.userId 
          ? { ...player, position: data.newPosition }
          : player
      )
    }));
  };

  const handleBattleEnd = async (result) => {
    try {
      await axios.post('/api/game/battle-result', {
        userId: user.id,
        gameId: gameState.gameId,
        result
      });

      setShowBattle(false);
      setBattleData(null);

      socket.emit('battleEnded', {
        gameId: gameState.gameId,
        userId: user.id,
        result
      });
    } catch (err) {
      setError('Erro ao processar resultado da batalha');
    }
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="pokemon-title">Pokémon Board Game</h1>
          <button
            onClick={logout}
            className="pokemon-button bg-pokemon-red"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Sair
          </button>
        </div>

        {/* Erro */}
        {error && (
          <div className="text-pokemon-red text-center mb-4">
            {error}
          </div>
        )}

        {/* Info dos Jogadores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {gameState.players.map((player) => (
            <PlayerInfo
              key={player.id}
              player={player}
              isCurrentPlayer={gameState.currentPlayer === player.id}
            />
          ))}
        </div>

        {/* Tabuleiro */}
        <div className="pokemon-board mb-8">
          {gameState.board.map((cell, index) => (
            <GameCell
              key={index}
              index={index}
              cell={cell}
              players={gameState.players.filter(p => p.position === index)}
            />
          ))}
        </div>

        {/* Controles */}
        <div className="flex justify-center">
          <button
            onClick={handleRollDice}
            disabled={gameState.currentPlayer !== user.id || showBattle}
            className={`pokemon-button ${
              gameState.currentPlayer !== user.id || showBattle
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <i className="fas fa-dice mr-2"></i>
            Rolar Dado
          </button>
        </div>

        {/* Modais */}
        {showDice && <DiceRoll />}
        {showBattle && (
          <BattleModal
            battleData={battleData}
            onBattleEnd={handleBattleEnd}
            userPokemon={user.pokemon}
          />
        )}
      </div>
    </div>
  );
};

export default GameBoard;
