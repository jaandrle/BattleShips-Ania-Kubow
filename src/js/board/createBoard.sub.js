
gulp_place("./createBoardDiv.sub.js", "file_once");/* global createBoardDiv */
/**
 * Fills given board `target_el` with squares (see returned `div`s)
 * @param {HTMLDivElement} target_el 
 * @param {number} length Overall count of games squares
 * @returns {HTMLDivElement[]}
 */
function createBoard(target_el, length){
    return Array.from({ length })
        .map((_, i)=> target_el.appendChild(createBoardDiv(i)));
}