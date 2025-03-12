// User Types
export interface User {
  id: string;
  username: string;
  hasStarter: boolean;
  pokemon?: Pokemon;
  position?: number;
  isOnline?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

// Pokemon Types
export interface Pokemon {
  id: number;
  name: string;
  level: number;
  experience: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  moves: Move[];
  types: string[];
  sprite: string;
  evolution?: Evolution;
}

export interface Move {
  id: number;
  name: string;
  power: number;
  accuracy: number;
  type: string;
  category: 'physical' | 'special' | 'status';
  pp: number;
  maxPp: number;
}

export interface Evolution {
  level: number;
  evolvesTo: number;
  evolutionDetails: {
    trigger: string;
    minLevel?: number;
    item?: string;
  };
}

// Game Types
export interface GameState {
  players: User[];
  currentTurn: string;
  board: BoardCell[];
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner?: User;
}

export interface BoardCell {
  id: number;
  type: 'empty' | 'pokemon' | 'item' | 'event';
  content?: {
    type: string;
    data: any;
  };
  position: number;
}

export interface Battle {
  id: string;
  player1: User;
  player2: User;
  pokemon1: Pokemon;
  pokemon2: Pokemon;
  currentTurn: string;
  moves: BattleMove[];
  status: 'active' | 'finished';
  winner?: User;
}

export interface BattleMove {
  userId: string;
  moveId: number;
  damage: number;
  critical: boolean;
  effective: number;
  timestamp: Date;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  starterPokemon: number;
}

// Socket Types
export interface ServerToClientEvents {
  gameUpdate: (state: GameState) => void;
  battleUpdate: (battle: Battle) => void;
  playerJoined: (player: User) => void;
  playerLeft: (playerId: string) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  joinGame: (gameId: string) => void;
  leaveGame: (gameId: string) => void;
  rollDice: () => void;
  useMove: (moveId: number) => void;
  selectStarter: (pokemonId: number) => void;
}
