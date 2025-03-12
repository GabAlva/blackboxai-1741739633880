const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database/pokemon_game.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados SQLite');
    
    // Criar tabelas
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS pokemons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        pokemon_id INTEGER,
        name TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        is_shiny BOOLEAN DEFAULT 0,
        iv_hp INTEGER DEFAULT 10,
        iv_attack INTEGER DEFAULT 10,
        iv_defense INTEGER DEFAULT 10,
        iv_sp_attack INTEGER DEFAULT 10,
        iv_sp_defense INTEGER DEFAULT 10,
        iv_speed INTEGER DEFAULT 10,
        moves TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status TEXT DEFAULT 'waiting',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        winner_id INTEGER,
        FOREIGN KEY (winner_id) REFERENCES users (id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS game_players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER,
        user_id INTEGER,
        position INTEGER DEFAULT 0,
        current_pokemon_id INTEGER,
        FOREIGN KEY (game_id) REFERENCES games (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (current_pokemon_id) REFERENCES pokemons (id)
    )`);
});

module.exports = db;
