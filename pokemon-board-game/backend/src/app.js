const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { authMiddleware } = require('./middleware/auth');

// Importar rotas
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');

// Configurar variáveis de ambiente
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/game', authMiddleware, gameRoutes);

// Gerenciamento de conexões Socket.IO
const activeGames = new Map();
const userSockets = new Map();

io.on('connection', (socket) => {
    console.log('Novo usuário conectado:', socket.id);

    socket.on('authenticate', (token) => {
        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            userSockets.set(user.userId, socket);
            socket.userId = user.userId;
            console.log(`Usuário ${user.userId} autenticado`);
        } catch (error) {
            console.error('Erro na autenticação do socket:', error);
        }
    });

    socket.on('joinGame', (gameId) => {
        socket.join(`game:${gameId}`);
        
        if (!activeGames.has(gameId)) {
            activeGames.set(gameId, {
                players: new Set(),
                status: 'waiting',
                currentTurn: null
            });
        }

        const game = activeGames.get(gameId);
        game.players.add(socket.userId);

        // Se atingiu 4 jogadores, iniciar o jogo
        if (game.players.size === 4) {
            game.status = 'active';
            game.currentTurn = Array.from(game.players)[0];
            io.to(`game:${gameId}`).emit('gameStart', {
                gameId,
                players: Array.from(game.players),
                currentTurn: game.currentTurn
            });
        }

        // Notificar todos os jogadores sobre o novo jogador
        io.to(`game:${gameId}`).emit('playerJoined', {
            gameId,
            playerId: socket.userId,
            playerCount: game.players.size
        });
    });

    socket.on('move', async (data) => {
        const { gameId, position } = data;
        const game = activeGames.get(gameId);

        if (game && game.currentTurn === socket.userId) {
            // Atualizar posição do jogador
            io.to(`game:${gameId}`).emit('playerMoved', {
                playerId: socket.userId,
                position
            });

            // Passar para o próximo jogador
            const players = Array.from(game.players);
            const currentIndex = players.indexOf(game.currentTurn);
            game.currentTurn = players[(currentIndex + 1) % players.length];

            io.to(`game:${gameId}`).emit('turnChanged', {
                currentTurn: game.currentTurn
            });
        }
    });

    socket.on('battleResult', (data) => {
        const { gameId, result } = data;
        io.to(`game:${gameId}`).emit('battleEnded', {
            playerId: socket.userId,
            result
        });
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
        
        if (socket.userId) {
            userSockets.delete(socket.userId);
            
            // Remover jogador de jogos ativos
            activeGames.forEach((game, gameId) => {
                if (game.players.has(socket.userId)) {
                    game.players.delete(socket.userId);
                    
                    // Se não houver mais jogadores, remover o jogo
                    if (game.players.size === 0) {
                        activeGames.delete(gameId);
                    } else {
                        // Notificar outros jogadores
                        io.to(`game:${gameId}`).emit('playerLeft', {
                            playerId: socket.userId,
                            playerCount: game.players.size
                        });
                    }
                }
            });
        }
    });
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Rota de teste
app.get('/', (req, res) => {
    res.json({ message: 'Pokémon Board Game API' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = { app, io };
