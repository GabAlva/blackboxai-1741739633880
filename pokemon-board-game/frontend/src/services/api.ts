import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';
import type {
  ApiResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  Pokemon,
  ServerToClientEvents,
  ClientToServerEvents,
} from '../types';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pokemon_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pokemon_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  async verifyToken(): Promise<ApiResponse<User>> {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  async getStarterPokemons(): Promise<ApiResponse<Pokemon[]>> {
    const response = await api.get('/auth/starters');
    return response.data;
  },
};

// Game Service
export const gameService = {
  async createGame(): Promise<ApiResponse<string>> {
    const response = await api.post('/game/create');
    return response.data;
  },

  async joinGame(gameId: string): Promise<ApiResponse<void>> {
    const response = await api.post(`/game/${gameId}/join`);
    return response.data;
  },

  async leaveGame(gameId: string): Promise<ApiResponse<void>> {
    const response = await api.post(`/game/${gameId}/leave`);
    return response.data;
  },

  async getGameState(gameId: string): Promise<ApiResponse<any>> {
    const response = await api.get(`/game/${gameId}`);
    return response.data;
  },
};

// Pokemon Service
export const pokemonService = {
  async getPokemonDetails(id: number): Promise<ApiResponse<Pokemon>> {
    const response = await api.get(`/pokemon/${id}`);
    return response.data;
  },

  async evolvePokemon(pokemonId: number): Promise<ApiResponse<Pokemon>> {
    const response = await api.post(`/pokemon/${pokemonId}/evolve`);
    return response.data;
  },

  async healPokemon(pokemonId: number): Promise<ApiResponse<Pokemon>> {
    const response = await api.post(`/pokemon/${pokemonId}/heal`);
    return response.data;
  },
};

// Socket Service
class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.info('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.info('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit<T extends keyof ClientToServerEvents>(
    event: T,
    ...args: Parameters<ClientToServerEvents[T]>
  ) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit(event, ...args);
  }

  on<T extends keyof ServerToClientEvents>(
    event: T,
    callback: ServerToClientEvents[T]
  ) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }
    this.socket.on(event, callback);
  }

  off<T extends keyof ServerToClientEvents>(event: T) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }
    this.socket.off(event);
  }
}

export const SocketService = new SocketService();

export default api;
