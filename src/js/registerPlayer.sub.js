gulp_place("./board/isOutOfBoard.sub.js", "file_once");/* global isOutOfBoard */
gulp_place("./dispatchGameEvent.sub.js", "file_once");/* global dispatchGameEvent */
gulp_place("./game/game.type.sub.js", "file_once");
/**
 * @param {game} game
 * @param {HTMLElement} grid_user
 * @param {HTMLDivElement[]} ships
 * @fires game
 */
function registerPlayer(game, grid_user, ships){
    let player_ships_done= 0;
    grid_user.addEventListener("dragover", event=> event.preventDefault(), false);//to `drop` allow
    grid_user.addEventListener("drop", function(event){
        const [ ship_type_name, part ]= event.dataTransfer.getData("text/html").split("|");
        const { player_ships_rotation, boards: { user }, width }= game;
        const { directions }= game.types_ships.find(({ name })=> name===ship_type_name);
        const start= parseInt(event.target.dataset.id) - parseInt(part) * ( player_ships_rotation ? width : 1 );
        const coordinates= directions[player_ships_rotation].map(i=> i+start);
        
        if(isOutOfBoard(coordinates, game)) return false;
        if(coordinates.some(i=> user[i].hasAttribute("name"))) return false;

        coordinates.forEach(i=> user[i].setAttribute("name", ship_type_name));
        ships[ship_type_name].dataset.used= 1;
        player_ships_done+= 1;
        if(player_ships_done===game.types_ships.length) dispatchGameEvent(grid_user, { type: "ready", loss: 0 });
    }, false);
}