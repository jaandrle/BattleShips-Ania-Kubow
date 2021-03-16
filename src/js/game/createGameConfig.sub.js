gulp_place("../ship/createShip.sub.js", "file_once");/* global createShip */
gulp_place("../board/createBoard.sub.js", "file_once");/* global createBoard */
gulp_place("./game.type.sub.js", "file_once");
/**
 * @param {number} width Squares number per width/height of boards
 * @returns {game}
 */
function createGameConfig({ width, grid_user, grid_opponent }){
    const count_squares= width*width;
    return {
        state: "start",
        width, count_squares,
        player_ships_rotation: 0,
        types_ships: [ ],
        results: [ ],
        boards: {
            user: createBoard(grid_user, count_squares),
            opponent: createBoard(grid_opponent, count_squares)
        },
        current_player_id: 0,
        max_score: 0,
        players: []
    };
}