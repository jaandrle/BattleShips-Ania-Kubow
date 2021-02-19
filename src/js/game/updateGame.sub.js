gulp_place("./game.type.sub.js", "file_once");
/**
 * @param {game} game
 * @param {object} new_data
 */
function updateGame(game, new_data){
    Object.assign(game, new_data);
    if(!game.player_ships_todo){
        Object.assign(game, { state: "game" });
        game.onbeforegame.forEach(f=> f());
    }
}