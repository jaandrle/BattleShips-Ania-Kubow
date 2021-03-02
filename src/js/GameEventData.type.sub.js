/**
 * @typedef GameEventData
 * @type {GED_fire|GED_game|GED_roundEnd|GED_roundStart}
 */
/**
 * @typedef GED_fire
 * @type {object}
 * @property {"fire"} type
 * @property {boolean} loss
 */
/**
 * @typedef GED_game
 * @type {object}
 * @property {"start"|"ready"|"end"} type
 * @property {HTMLElement} grid_el
 * @property {game} game
 * @property {ship[]} ships
 */
/**
 * @typedef GED_roundStart
 * @type {object}
 * @property {"round-start"} type
 */
/**
 * @typedef GED_roundEnd
 * @type {object}
 * @property {"round-end"} type
 * @property {number} current_player_id
 * @property {boolean} loss
 */