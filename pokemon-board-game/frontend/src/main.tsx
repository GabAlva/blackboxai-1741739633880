import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';

// Configuração do Axios para interceptar erros globalmente
import axios from 'axios';
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pokemon_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Configuração do Socket.IO
import { SocketService } from './services/api';
const token = localStorage.getItem('pokemon_token');
if (token) {
  SocketService.connect(token);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Limpeza na desmontagem
window.addEventListener('unload', () => {
  SocketService.disconnect();
});
