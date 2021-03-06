/**
 * @typedef player
 * @type {object}
 * @property {string} name Player name
 * @property {string} player Player type
 * @property {number} loss
 */
/**
 * @typedef game
 * @type {object}
 * @property {"start"|"ready"|"game"|"end"} state Game state
 * @property {number} width Game width/height
 * @property {number} count_squares All squares count (width^2)
 * @property {0|1} player_ships_rotation Horizontal/verical
 * @property {ship[]} types_ships
 * @property {results[]} results Array of results per `players` (in the same order) and `types_ships` ⇒ `[ [].length===types_ships.length, … ].length===players.length`
 * @property {{ user: HTMLDivElement[], opponent: HTMLDivElement[] }} boards
 * @property {0|1} current_player_id
 * @property {number} max_score
 * @property {player[]} players
 */