gulp_place("./registerComputer.sub.js", "file_once");/* global registerComputer */
gulp_place("./game/createGameConfig.sub.js", "file_once");/* global createGameConfig */
gulp_place("./game/updateGame.sub.js", "file_once");/* global updateGame */
gulp_place("./game/toggleRotation.sub.js", "file_once");/* global toggleRotation */
gulp_place("./board/isOutOfBoard.sub.js", "file_once");/* global isOutOfBoard */
gulp_place("./game/fire_data.type.sub.js", "file_once");

function main(){
    const [ grid_user, grid_opponent, grid_display ]= [ "user", "opponent", "display" ].map(name=> document.getElementsByClassName("grid-"+name)[0]);
    const ships= document.getElementsByClassName("ship");
    const button_rotate= document.getElementById("rotate");
    const [ display_turn, display_info ]= [ "whose-go", "info" ].map(id=> document.getElementById(id));
    
    const game= createGameConfig({
        width: 10,
        grid_user, grid_opponent
    });
    document.body.setAttribute("style", `--count-squares: ${game.width};`);//sync with CSS
    
    registerComputer(game, grid_opponent);
    display_info.textContent= "Prepare your fleet!";
    game.onbeforegame.push(()=> display_info.textContent= "Now you can fires to computer!");

    grid_display.addEventListener("mousedown", ({ target })=> target.parentElement.dataset.part= target.dataset.id);//propagate exact choosen part of ship
    grid_display.addEventListener("dragstart", event=> event.dataTransfer.setData("text/html", event.target.getAttribute("name")+"|"+event.target.dataset.part));
    grid_user.addEventListener("dragover", event=> event.preventDefault(), false);//to `drop` allow
    grid_user.addEventListener("drop", function(event){
        const [ ship_type_name, part ]= event.dataTransfer.getData("text/html").split("|");
        const { player_ships_rotation, player_ships_todo, boards: { user }, width }= game;
        const { directions }= game.types_ships.find(({ name })=> name===ship_type_name);
        const start= parseInt(event.target.dataset.id) - parseInt(part) * ( player_ships_rotation ? width : 1 );
        const coordinates= directions[player_ships_rotation].map(i=> i+start);
        
        if(isOutOfBoard(coordinates, game)) return false;
        if(coordinates.some(i=> user[i].hasAttribute("name"))) return false;

        coordinates.forEach(i=> user[i].setAttribute("name", ship_type_name));
        ships[ship_type_name].dataset.used= 1;

        updateGame(game, {
            player_ships_todo: player_ships_todo-1
        });
    }, false);
    
    document.addEventListener("fire", /** @param {fire_data} def */({ detail })=> console.dir(detail)); /* jshint devel: true *///gulp.keep.line

    button_rotate.onclick= ()=> toggleRotation(game, grid_display);
}