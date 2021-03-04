/**
 * @param {number} n_coordinate 
 * @param {number} width 
 * @returns {0|1} Laying in right border area (0 ⇔ nth coodinate is in right border)
 */
function isNotInRightBorder(n_coordinate, width){
    return (n_coordinate+1)%width ? 1 : 0;
}