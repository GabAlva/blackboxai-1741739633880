const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Garantir que o diretório database existe
const dbDir = path.resolve(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

const dbPath = path.resolve(dbDir, 'pokemon_game.db');
const db = new sqlite3.Database(dbPath);

console.log('Iniciando criação das tabelas...');

// Executar queries em sequência
db.serialize(() => {
    // Tabela de usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            badges INTEGER DEFAULT 0,
            gyms_defeated INTEGER DEFAULT 0
        )
    `);

    // Tabela de Pokémon
    db.run(`
        CREATE TABLE IF NOT EXISTS pokemons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            pokemon_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            experience INTEGER DEFAULT 0,
            is_shiny BOOLEAN DEFAULT 0,
            current_hp INTEGER,
            max_hp INTEGER,
            iv_hp INTEGER DEFAULT 10,
            iv_attack INTEGER DEFAULT 10,
            iv_defense INTEGER DEFAULT 10,
            iv_sp_attack INTEGER DEFAULT 10,
            iv_sp_defense INTEGER DEFAULT 10,
            iv_speed INTEGER DEFAULT 10,
            moves TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `);

    // Tabela de partidas
    db.run(`
        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            status TEXT DEFAULT 'waiting',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            winner_id INTEGER,
            max_players INTEGER DEFAULT 4,
            current_turn INTEGER,
            FOREIGN KEY (winner_id) REFERENCES users (id),
            FOREIGN KEY (current_turn) REFERENCES users (id)
        )
    `);

    // Tabela de jogadores na partida
    db.run(`
        CREATE TABLE IF NOT EXISTS game_players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER,
            user_id INTEGER,
            position INTEGER DEFAULT 0,
            current_pokemon_id INTEGER,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (game_id) REFERENCES games (id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (current_pokemon_id) REFERENCES pokemons (id)
        )
    `);

    // Tabela de movimentos dos Pokémon
    db.run(`
        CREATE TABLE IF NOT EXISTS pokemon_moves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pokemon_id INTEGER,
            move_id INTEGER,
            move_name TEXT NOT NULL,
            pp INTEGER NOT NULL,
            pp_max INTEGER NOT NULL,
            FOREIGN KEY (pokemon_id) REFERENCES pokemons (id)
        )
    `);

    // Tabela de batalhas
    db.run(`
        CREATE TABLE IF NOT EXISTS battles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER,
            player_id INTEGER,
            pokemon_id INTEGER,
            opponent_type TEXT NOT NULL,
            opponent_id INTEGER,
            result TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (game_id) REFERENCES games (id),
            FOREIGN KEY (player_id) REFERENCES users (id),
            FOREIGN KEY (pokemon_id) REFERENCES pokemons (id)
        )
    `);

    // Tabela de líderes de ginásio
    db.run(`
        CREATE TABLE IF NOT EXISTS gym_leaders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            badge_name TEXT NOT NULL,
            pokemon_team TEXT NOT NULL,
            difficulty INTEGER DEFAULT 1
        )
    `);

    // Inserir líderes de ginásio padrão
    db.run(`
        INSERT OR IGNORE INTO gym_leaders (name, type, badge_name, pokemon_team, difficulty)
        VALUES 
        ('Brock', 'rock', 'Boulder Badge', '{"pokemon": ["onix", "geodude"]}', 1),
        ('Misty', 'water', 'Cascade Badge', '{"pokemon": ["staryu", "starmie"]}', 2),
        ('Lt. Surge', 'electric', 'Thunder Badge', '{"pokemon": ["voltorb", "pikachu", "raichu"]}', 3),
        ('Erika', 'grass', 'Rainbow Badge', '{"pokemon": ["victreebel", "tangela", "vileplume"]}', 4),
        ('Koga', 'poison', 'Soul Badge', '{"pokemon": ["koffing", "muk", "weezing"]}', 5),
        ('Sabrina', 'psychic', 'Marsh Badge', '{"pokemon": ["kadabra", "mr-mime", "alakazam"]}', 6)
    `);
});

// Verificar se as tabelas foram criadas
db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, tables) => {
    if (err) {
        console.error('Erro ao verificar tabelas:', err);
        process.exit(1);
    }
    
    console.log('Tabelas criadas com sucesso:');
    tables.forEach(table => {
        console.log(`- ${table.name}`);
    });

    // Fechar conexão com o banco
    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar banco de dados:', err);
            process.exit(1);
        }
        console.log('Inicialização do banco de dados concluída!');
    });
});
