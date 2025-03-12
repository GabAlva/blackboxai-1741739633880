const express = require('express');
const router = express.Router();
const db = require('../config/database');
const PokeApiService = require('../services/pokeapi');
const { io } = require('../app');

// Configuração do tabuleiro
const BOARD_CONFIG = {
    totalSpaces: 40,
    gymLeaderSpaces: 6,
    eliteFourSpace: 1,
    minLevel: 5,
    maxLevel: 50
};

// Rota para criar nova partida
router.post('/create', (req, res) => {
    const { userId } = req.body;

    db.run('INSERT INTO games (status) VALUES (?)', ['waiting'], function(err) {
        if (err) {
            console.error('Erro ao criar partida:', err);
            return res.status(500).json({ error: 'Erro ao criar partida' });
        }

        const gameId = this.lastID;

        // Adicionar criador como primeiro jogador
        db.run('INSERT INTO game_players (game_id, user_id, position) VALUES (?, ?, ?)',
            [gameId, userId, 0],
            (err) => {
                if (err) {
                    console.error('Erro ao adicionar jogador:', err);
                    return res.status(500).json({ error: 'Erro ao adicionar jogador' });
                }

                res.status(201).json({
                    message: 'Partida criada com sucesso',
                    gameId
                });

                // Notificar outros jogadores sobre nova partida
                io.emit('newGame', { gameId });
            }
        );
    });
});

// Rota para entrar em uma partida
router.post('/join', (req, res) => {
    const { userId, gameId } = req.body;

    // Verificar se a partida existe e está aguardando jogadores
    db.get('SELECT * FROM games WHERE id = ? AND status = ?', 
        [gameId, 'waiting'],
        (err, game) => {
            if (err) {
                console.error('Erro ao buscar partida:', err);
                return res.status(500).json({ error: 'Erro ao buscar partida' });
            }

            if (!game) {
                return res.status(404).json({ error: 'Partida não encontrada ou já iniciada' });
            }

            // Verificar número de jogadores
            db.all('SELECT * FROM game_players WHERE game_id = ?', [gameId], (err, players) => {
                if (err) {
                    console.error('Erro ao buscar jogadores:', err);
                    return res.status(500).json({ error: 'Erro ao buscar jogadores' });
                }

                if (players.length >= 4) {
                    return res.status(400).json({ error: 'Partida já está cheia' });
                }

                // Adicionar jogador
                db.run('INSERT INTO game_players (game_id, user_id, position) VALUES (?, ?, ?)',
                    [gameId, userId, 0],
                    (err) => {
                        if (err) {
                            console.error('Erro ao adicionar jogador:', err);
                            return res.status(500).json({ error: 'Erro ao adicionar jogador' });
                        }

                        // Se atingiu 4 jogadores, iniciar partida
                        if (players.length === 3) {
                            db.run('UPDATE games SET status = ? WHERE id = ?',
                                ['active', gameId],
                                (err) => {
                                    if (err) {
                                        console.error('Erro ao atualizar status da partida:', err);
                                    }
                                }
                            );
                            io.to(gameId).emit('gameStart', { gameId });
                        }

                        res.json({
                            message: 'Entrou na partida com sucesso',
                            gameId
                        });

                        // Notificar outros jogadores
                        io.to(gameId).emit('playerJoined', { 
                            gameId, 
                            userId,
                            playersCount: players.length + 1
                        });
                    }
                );
            });
        }
    );
});

// Rota para rolar o dado e mover
router.post('/roll', async (req, res) => {
    const { userId, gameId } = req.body;

    try {
        // Verificar se é a vez do jogador
        db.get(`
            SELECT gp.*, g.status 
            FROM game_players gp 
            JOIN games g ON g.id = gp.game_id 
            WHERE g.id = ? AND gp.user_id = ?`,
            [gameId, userId],
            async (err, player) => {
                if (err || !player) {
                    return res.status(400).json({ error: 'Jogador não encontrado na partida' });
                }

                if (player.status !== 'active') {
                    return res.status(400).json({ error: 'Partida não está ativa' });
                }

                // Rolar o dado (1-6)
                const diceRoll = Math.floor(Math.random() * 6) + 1;
                const newPosition = Math.min(player.position + diceRoll, BOARD_CONFIG.totalSpaces);

                // Atualizar posição do jogador
                db.run('UPDATE game_players SET position = ? WHERE game_id = ? AND user_id = ?',
                    [newPosition, gameId, userId],
                    async (err) => {
                        if (err) {
                            return res.status(500).json({ error: 'Erro ao atualizar posição' });
                        }

                        let encounter = null;

                        // Verificar se caiu em casa especial (líder/elite4)
                        if (isGymLeaderSpace(newPosition)) {
                            encounter = await generateGymLeaderEncounter(newPosition);
                        } else {
                            // Gerar encontro com Pokémon selvagem
                            const level = calculateWildPokemonLevel(newPosition);
                            encounter = await PokeApiService.getRandomPokemon(level.min, level.max);
                        }

                        res.json({
                            diceRoll,
                            newPosition,
                            encounter
                        });

                        // Notificar outros jogadores
                        io.to(gameId).emit('playerMoved', {
                            gameId,
                            userId,
                            diceRoll,
                            newPosition,
                            encounter
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Erro ao processar movimento:', error);
        res.status(500).json({ error: 'Erro ao processar movimento' });
    }
});

// Rota para batalha
router.post('/battle', async (req, res) => {
    const { userId, gameId, action, targetPokemonId } = req.body;

    try {
        // Buscar Pokémon atual do jogador
        db.get(`
            SELECT p.* 
            FROM pokemons p
            JOIN game_players gp ON gp.current_pokemon_id = p.id
            WHERE gp.game_id = ? AND gp.user_id = ?`,
            [gameId, userId],
            async (err, playerPokemon) => {
                if (err || !playerPokemon) {
                    return res.status(400).json({ error: 'Pokémon do jogador não encontrado' });
                }

                let result;
                switch (action) {
                    case 'attack':
                        result = await processBattle(playerPokemon, targetPokemonId);
                        break;
                    case 'capture':
                        result = await processPokemonCapture(userId, targetPokemonId);
                        break;
                    case 'run':
                        result = { success: Math.random() > 0.5 }; // 50% chance de fuga
                        break;
                    default:
                        return res.status(400).json({ error: 'Ação inválida' });
                }

                res.json(result);

                // Notificar outros jogadores sobre o resultado da batalha
                io.to(gameId).emit('battleResult', {
                    gameId,
                    userId,
                    action,
                    result
                });
            }
        );
    } catch (error) {
        console.error('Erro na batalha:', error);
        res.status(500).json({ error: 'Erro ao processar batalha' });
    }
});

// Funções auxiliares
function isGymLeaderSpace(position) {
    // Distribuir líderes e Elite 4 uniformemente pelo tabuleiro
    const gymPositions = Array.from({ length: BOARD_CONFIG.gymLeaderSpaces }, (_, i) => 
        Math.floor((i + 1) * (BOARD_CONFIG.totalSpaces / (BOARD_CONFIG.gymLeaderSpaces + 1)))
    );
    return gymPositions.includes(position);
}

function calculateWildPokemonLevel(position) {
    // Aumentar nível conforme avança no tabuleiro
    const progress = position / BOARD_CONFIG.totalSpaces;
    const minLevel = Math.floor(BOARD_CONFIG.minLevel + (progress * 20));
    const maxLevel = Math.floor(minLevel + 5);
    return { min: minLevel, max: maxLevel };
}

async function generateGymLeaderEncounter(position) {
    // Lista de possíveis líderes de ginásio com seus Pokémon signature
    const gymLeaders = [
        { name: 'Brock', pokemon: 'onix' },
        { name: 'Misty', pokemon: 'starmie' },
        { name: 'Lt. Surge', pokemon: 'raichu' },
        { name: 'Erika', pokemon: 'vileplume' },
        { name: 'Koga', pokemon: 'weezing' },
        { name: 'Sabrina', pokemon: 'alakazam' },
        { name: 'Blaine', pokemon: 'arcanine' },
        { name: 'Giovanni', pokemon: 'nidoking' }
    ];

    const leader = gymLeaders[Math.floor(Math.random() * gymLeaders.length)];
    const pokemon = await PokeApiService.getPokemon(leader.pokemon);
    
    return {
        type: 'gymLeader',
        leader: leader.name,
        pokemon: {
            ...pokemon,
            level: 30 + Math.floor(position / 2)
        }
    };
}

async function processBattle(playerPokemon, targetPokemonId) {
    // Implementar lógica de batalha aqui
    // Por enquanto, retorna resultado simplificado
    return {
        success: true,
        experienceGained: 100,
        levelUp: false
    };
}

async function processPokemonCapture(userId, targetPokemonId) {
    try {
        const pokemon = await PokeApiService.getPokemon(targetPokemonId);
        
        // Chance de captura baseada no nível do Pokémon
        const captureChance = Math.max(0.1, 1 - (pokemon.base_experience / 1000));
        const captured = Math.random() < captureChance;

        if (captured) {
            // Implementar lógica de captura e atualização de IVs
            // Por enquanto, retorna sucesso
            return {
                success: true,
                message: 'Pokémon capturado com sucesso!'
            };
        }

        return {
            success: false,
            message: 'Pokémon escapou!'
        };
    } catch (error) {
        console.error('Erro ao processar captura:', error);
        throw error;
    }
}

module.exports = router;
