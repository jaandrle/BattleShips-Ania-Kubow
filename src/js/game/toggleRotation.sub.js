gulp_place("./game.type.sub.js", "file_once");
/**
 * @param {game} game
 * @param {HTMLElement} grid_display
 */
function toggleRotation(game, grid_display){
    const player_ships_rotation= game.player_ships_rotation ? 0 : 1;
    grid_display.dataset.rotated= player_ships_rotation;
    Object.assign(game, { player_ships_rotation });
}