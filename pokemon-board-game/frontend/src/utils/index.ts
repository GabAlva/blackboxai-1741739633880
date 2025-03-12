import type { Pokemon, PokemonStat, GameConfig } from '../types';

// Configurações do jogo
export const GAME_CONFIG: GameConfig = {
  totalSpaces: 40,
  gymLeaderSpaces: 6,
  eliteFourSpace: 1,
  minLevel: 5,
  maxLevel: 50,
};

// Cores dos tipos de Pokémon
export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

// Funções de cálculo de estatísticas
export const calculatePokemonStats = (
  baseStat: number,
  level: number,
  iv: number
): number => {
  return Math.floor(((2 * baseStat + iv) * level) / 100 + 5);
};

export const calculateHP = (
  baseHP: number,
  level: number,
  iv: number
): number => {
  return Math.floor(((2 * baseHP + iv) * level) / 100 + level + 10);
};

// Função para calcular dano
export const calculateDamage = (
  attacker: Pokemon,
  defender: Pokemon,
  movePower: number,
  effectiveness: number
): number => {
  const attack = attacker.stats.find((s) => s.name === 'attack')?.base || 0;
  const defense = defender.stats.find((s) => s.name === 'defense')?.base || 0;
  const level = attacker.level;

  const baseDamage = Math.floor(
    ((2 * level) / 5 + 2) * movePower * (attack / defense)
  );
  
  const damage = Math.floor((baseDamage / 50 + 2) * effectiveness);
  
  return Math.max(1, damage); // Dano mínimo de 1
};

// Função para calcular chance de captura
export const calculateCatchRate = (
  pokemonLevel: number,
  currentHP: number,
  maxHP: number,
  baseRate: number = 45
): number => {
  const hpFactor = currentHP / maxHP;
  const levelFactor = 1 - (pokemonLevel / GAME_CONFIG.maxLevel);
  const baseChance = baseRate / 255;

  return Math.min(0.9, baseChance * (1 - hpFactor) * levelFactor);
};

// Função para formatar nome de Pokémon
export const formatPokemonName = (name: string): string => {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Função para gerar cor de gradiente baseada no nível
export const getLevelColor = (level: number): string => {
  const maxLevel = GAME_CONFIG.maxLevel;
  const percentage = (level / maxLevel) * 100;

  if (percentage < 20) return '#98FF98'; // Verde claro
  if (percentage < 40) return '#32CD32'; // Verde lima
  if (percentage < 60) return '#FFD700'; // Dourado
  if (percentage < 80) return '#FFA500'; // Laranja
  return '#FF4500'; // Vermelho-laranja
};

// Função para calcular experiência necessária para próximo nível
export const getExpToNextLevel = (level: number): number => {
  return Math.pow(level, 3);
};

// Função para verificar se é uma posição de líder de ginásio
export const isGymLeaderSpace = (position: number): boolean => {
  const gymPositions = Array.from(
    { length: GAME_CONFIG.gymLeaderSpaces },
    (_, i) => Math.floor((i + 1) * (GAME_CONFIG.totalSpaces / (GAME_CONFIG.gymLeaderSpaces + 1)))
  );
  return gymPositions.includes(position);
};

// Função para calcular nível de Pokémon selvagem baseado na posição
export const getWildPokemonLevel = (position: number): number => {
  const progress = position / GAME_CONFIG.totalSpaces;
  const levelRange = GAME_CONFIG.maxLevel - GAME_CONFIG.minLevel;
  return Math.floor(GAME_CONFIG.minLevel + (progress * levelRange));
};

// Função para formatar estatísticas
export const formatStat = (stat: PokemonStat): string => {
  return stat.name
    .replace('-', ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Função para gerar uma cor aleatória para jogador
export const getPlayerColor = (index: number): string => {
  const colors = [
    '#FF0000', // Vermelho
    '#00FF00', // Verde
    '#0000FF', // Azul
    '#FFFF00', // Amarelo
  ];
  return colors[index % colors.length];
};

// Função para calcular tempo restante
export const formatTimeRemaining = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Função para gerar mensagem de batalha
export const generateBattleMessage = (
  action: string,
  success: boolean,
  pokemonName: string
): string => {
  const messages = {
    attack: {
      success: `${pokemonName} atacou com sucesso!`,
      failure: `${pokemonName} errou o ataque!`,
    },
    capture: {
      success: `${pokemonName} foi capturado!`,
      failure: `${pokemonName} escapou da Pokébola!`,
    },
    run: {
      success: 'Fugiu com sucesso!',
      failure: 'Não conseguiu fugir!',
    },
  };

  return messages[action as keyof typeof messages][success ? 'success' : 'failure'];
};
