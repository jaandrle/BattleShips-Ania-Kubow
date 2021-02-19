gulp_place("./ship/computersShip.sub.js", "file_once");/* global computersShip */
gulp_place("./game/fireDetection.sub.js", "file_once");/* global fireDetection */
gulp_place("./game/game.type.sub.js", "file_once");
/**
 * @param {game} game
 * @param {HTMLElement} grid_opponent
 */
function registerComputer(game, grid_opponent){
    grid_opponent.classList.add("fog");
    game.types_ships.forEach(ship_type=> computersShip(ship_type, game));
    grid_opponent.setAttribute("player", "Computer");
    game.onbeforegame.push(()=> grid_opponent.onclick= fireDetection);
}