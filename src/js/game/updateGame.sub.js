gulp_place("./game.type.sub.js", "file_once");
/**
 * @param {game} game
 * @param {object} new_data
 */
function updateGame(game, new_data){
    Object.assign(game, new_data);
}