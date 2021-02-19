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
        player_ships_todo: 5, //ships types
        types_ships: [
            createShip("destroyer", 2, width),
            createShip("submarine", 3, width),
            createShip("cruiser", 3, width),
            createShip("battleship", 4, width),
            createShip("carrier", 5, width)
        ],
        boards: {
            user: createBoard(grid_user, count_squares),
            opponent: createBoard(grid_opponent, count_squares)
        },
        onbeforegame: []
    };
}