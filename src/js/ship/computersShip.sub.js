gulp_place("../math_utils.sub.js", "file_once");/* global abs, randomIntegerTill */
gulp_place("../board/isOutOfBoard.sub.js", "file_once");/* global isOutOfBoard */
gulp_place("./ship.type.sub.js", "file_once");
gulp_place("../game/game.type.sub.js", "file_once");
/**
 * @param {ship} ship
 * @param {HTMLDivElement[]} squares generated boards `div`s
 * @param {game} game
 */
function computersShip(ship, game){
    const direction_index= randomIntegerTill(ship.directions.length);
    const direction= direction_index ? game.width : 1;

    const start= abs( randomIntegerTill(game.count_squares) - ship.length * direction );
    const current= ship.directions[direction_index].map(i=> i+start);
    const board= game.boards.opponent;
    
    if(isOutOfBoard(current, game) || /* is_taken */current.some(i=> board[i].hasAttribute("name")))
        return computersShip(ship, game);

    const name= ship.name;
    current.forEach(i=> board[i].setAttribute("name", name));
}