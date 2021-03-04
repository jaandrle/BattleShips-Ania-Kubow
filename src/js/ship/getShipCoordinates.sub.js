gulp_place("./ship_coordinates.type.sub.js", "file_once");
/**
 * Generates ship coordinates
 * @param {number} length
 * @param {number} shift
 * @returns {ship_coordinates}
 */
function getShipCoordinates(length, shift= 1){
    return Array.from({ length }).map((_, i)=> i*shift);
}