/**
 * @typedef game
 * @type {object}
 * @property {"start"|"ready"|"game"|"end"} state Game state
 * @property {number} width Game width/height
 * @property {number} count_squares All squares count (width^2)
 * @property {0|1} player_ships_rotation Horizontal/verical
 * @property {number} player_ships_todo Players ships remaining to add to grid
 * @property {ship[]} types_ships
 * @property {{ user: HTMLDivElement[], opponent: HTMLDivElement[] }} boards
 * @property {HTMLDivElement[]} grid_opponent
 */