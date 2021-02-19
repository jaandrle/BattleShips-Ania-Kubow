gulp_place("../game/game.type.sub.js", "file_once");
/**
 * @param {ship_coordinates} coordinates
 * @param {number} start
 * @param {game} game
 */
function isOutOfBoard(coordinates, { width, count_squares }){
    const l= coordinates.length-1;
    let m;
    //#1: Math → converting coordinates into array of 1 or zeroes
    //  ⇒ 0 ⇔ nth coodinate is in right border
    //  ⇒ so allowed combinations: all 1, all 0 or 1 with last item 0 (ship ends on right border)
    return coordinates.some((i, j)=> {
        if(!j) m= (i+1)%width ? 1 : 0;//#1
        if(i<0||i>count_squares-1) return true;//easy ;-)
        if(!j) return false;
        return ( (i+1)%width ? 1 : ( j===l ? m : 0 ) )!==m;//#1
    });
}