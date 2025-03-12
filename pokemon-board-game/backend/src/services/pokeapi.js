const axios = require('axios');

const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2';

// Cache para armazenar resultados das chamadas à API
const cache = new Map();

class PokeApiService {
    static async getPokemon(idOrName) {
        const cacheKey = `pokemon_${idOrName}`;
        
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        try {
            const response = await axios.get(`${POKE_API_BASE_URL}/pokemon/${idOrName}`);
            cache.set(cacheKey, response.data);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar Pokémon:', error);
            throw error;
        }
    }

    static async getStarterPokemons() {
        const starters = {
            kanto: ['bulbasaur', 'charmander', 'squirtle'],
            johto: ['chikorita', 'cyndaquil', 'totodile'],
            hoenn: ['treecko', 'torchic', 'mudkip'],
            sinnoh: ['turtwig', 'chimchar', 'piplup'],
            unova: ['snivy', 'tepig', 'oshawott'],
            kalos: ['chespin', 'fennekin', 'froakie'],
            alola: ['rowlet', 'litten', 'popplio'],
            galar: ['grookey', 'scorbunny', 'sobble']
        };

        const starterDetails = {};
        
        for (const [region, pokemons] of Object.entries(starters)) {
            starterDetails[region] = await Promise.all(
                pokemons.map(async name => {
                    const pokemon = await this.getPokemon(name);
                    return {
                        id: pokemon.id,
                        name: pokemon.name,
                        types: pokemon.types.map(t => t.type.name),
                        sprite: pokemon.sprites.front_default,
                        stats: pokemon.stats.map(s => ({
                            name: s.stat.name,
                            base: s.base_stat
                        }))
                    };
                })
            );
        }

        return starterDetails;
    }

    static async getRandomPokemon(minLevel, maxLevel) {
        try {
            // Obter número total de Pokémon
            const response = await axios.get(`${POKE_API_BASE_URL}/pokemon-species?limit=0`);
            const count = response.data.count;
            
            // Gerar ID aleatório
            const randomId = Math.floor(Math.random() * count) + 1;
            
            const pokemon = await this.getPokemon(randomId);
            
            // Gerar nível aleatório dentro do intervalo
            const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
            
            // Verificar se é shiny (1% de chance)
            const isShiny = Math.random() < 0.01;
            
            return {
                ...pokemon,
                level,
                isShiny,
                sprite: isShiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default
            };
        } catch (error) {
            console.error('Erro ao buscar Pokémon aleatório:', error);
            throw error;
        }
    }

    static async getPokemonMoves(pokemonId) {
        const cacheKey = `moves_${pokemonId}`;
        
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        try {
            const pokemon = await this.getPokemon(pokemonId);
            const moves = await Promise.all(
                pokemon.moves.map(async move => {
                    const moveData = await axios.get(move.move.url);
                    return {
                        id: moveData.data.id,
                        name: moveData.data.name,
                        type: moveData.data.type.name,
                        power: moveData.data.power,
                        accuracy: moveData.data.accuracy,
                        pp: moveData.data.pp,
                        damage_class: moveData.data.damage_class.name
                    };
                })
            );

            cache.set(cacheKey, moves);
            return moves;
        } catch (error) {
            console.error('Erro ao buscar movimentos do Pokémon:', error);
            throw error;
        }
    }

    static async getTypeEffectiveness(type) {
        const cacheKey = `type_${type}`;
        
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        try {
            const response = await axios.get(`${POKE_API_BASE_URL}/type/${type}`);
            const effectiveness = {
                double_damage_to: response.data.damage_relations.double_damage_to.map(t => t.name),
                half_damage_to: response.data.damage_relations.half_damage_to.map(t => t.name),
                no_damage_to: response.data.damage_relations.no_damage_to.map(t => t.name),
                double_damage_from: response.data.damage_relations.double_damage_from.map(t => t.name),
                half_damage_from: response.data.damage_relations.half_damage_from.map(t => t.name),
                no_damage_from: response.data.damage_relations.no_damage_from.map(t => t.name)
            };

            cache.set(cacheKey, effectiveness);
            return effectiveness;
        } catch (error) {
            console.error('Erro ao buscar efetividade do tipo:', error);
            throw error;
        }
    }
}

module.exports = PokeApiService;
