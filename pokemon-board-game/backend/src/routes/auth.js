const express = require('express');
const router = express.Router();
const db = require('../config/database');
const PokeApiService = require('../services/pokeapi');

// Rota para registro de novo usuário
router.post('/register', async (req, res) => {
    const { username, password, starterPokemon } = req.body;

    if (!username || !password || !starterPokemon) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        // Verificar se o usuário já existe
        db.get('SELECT id FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                console.error('Erro ao verificar usuário:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            if (user) {
                return res.status(400).json({ error: 'Usuário já existe' });
            }

            // Criar novo usuário
            db.run('INSERT INTO users (username, password) VALUES (?, ?)',
                [username, password], // Em produção, usar hash da senha
                async function(err) {
                    if (err) {
                        console.error('Erro ao criar usuário:', err);
                        return res.status(500).json({ error: 'Erro ao criar usuário' });
                    }

                    const userId = this.lastID;

                    try {
                        // Buscar dados do Pokémon inicial na PokeAPI
                        const pokemonData = await PokeApiService.getPokemon(starterPokemon);
                        
                        // Inserir Pokémon inicial do usuário
                        db.run(`INSERT INTO pokemons (
                            user_id, pokemon_id, name, level, 
                            iv_hp, iv_attack, iv_defense, 
                            iv_sp_attack, iv_sp_defense, iv_speed
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            userId, pokemonData.id, pokemonData.name, 5,
                            10, 10, 10, 10, 10, 10 // IVs iniciais
                        ], (err) => {
                            if (err) {
                                console.error('Erro ao salvar Pokémon inicial:', err);
                                return res.status(500).json({ error: 'Erro ao salvar Pokémon inicial' });
                            }

                            res.status(201).json({
                                message: 'Usuário registrado com sucesso',
                                userId,
                                starterPokemon: {
                                    name: pokemonData.name,
                                    id: pokemonData.id,
                                    types: pokemonData.types.map(t => t.type.name),
                                    sprite: pokemonData.sprites.front_default
                                }
                            });
                        });
                    } catch (error) {
                        console.error('Erro ao buscar dados do Pokémon:', error);
                        return res.status(500).json({ error: 'Erro ao buscar dados do Pokémon inicial' });
                    }
                }
            );
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }

    db.get('SELECT id, username FROM users WHERE username = ? AND password = ?',
        [username, password], // Em produção, verificar hash da senha
        (err, user) => {
            if (err) {
                console.error('Erro ao fazer login:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // Buscar Pokémons do usuário
            db.all('SELECT * FROM pokemons WHERE user_id = ?', [user.id], (err, pokemons) => {
                if (err) {
                    console.error('Erro ao buscar Pokémons:', err);
                    return res.status(500).json({ error: 'Erro ao buscar Pokémons' });
                }

                res.json({
                    message: 'Login realizado com sucesso',
                    user: {
                        id: user.id,
                        username: user.username,
                        pokemons: pokemons
                    }
                });
            });
        }
    );
});

// Rota para obter lista de Pokémons iniciais disponíveis
router.get('/starters', async (req, res) => {
    try {
        const starters = await PokeApiService.getStarterPokemons();
        res.json(starters);
    } catch (error) {
        console.error('Erro ao buscar Pokémons iniciais:', error);
        res.status(500).json({ error: 'Erro ao buscar Pokémons iniciais' });
    }
});

module.exports = router;
