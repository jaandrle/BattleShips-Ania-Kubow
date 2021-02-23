gulp_place("./ship/computersShip.sub.js", "file_once");/* global computersShip */
gulp_place("./game/fireDetection.sub.js", "file_once");/* global fireDetection */
gulp_place("./dispatchGameEvent.sub.js", "file_once");/* global dispatchGameEvent */
gulp_place("./game/game.type.sub.js", "file_once");
/**
 * @param {game} game
 * @param {HTMLElement} grid_opponent
 */
function registerComputer(game, grid_opponent){
    grid_opponent.classList.add("fog");
    game.types_ships.forEach(ship_type=> computersShip(ship_type, game));
    dispatchGameEvent(grid_opponent, { type: "ready", loss: 0 });
}