gulp_place("./getShipCoordinates.sub.js", "file_once");/* global getShipCoordinates */
gulp_place("./ship.type.sub.js", "file_once");
/**
 * @param {string} name
 * @param {number} length
 * @param {number} width_board
 * @returns {ship}
 */
function createShip(name, length, width_board) {
    return { name, length, directions: [ getShipCoordinates(length, 1), getShipCoordinates(length, width_board) ] };
}