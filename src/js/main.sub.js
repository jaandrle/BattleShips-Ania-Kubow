gulp_place("./registerComputer.sub.js", "file_once");/* global registerComputer */
gulp_place("./registerPlayer.sub.js", "file_once");/* global registerPlayer */
gulp_place("./game/createGameConfig.sub.js", "file_once");/* global createGameConfig */
gulp_place("./game/updateGame.sub.js", "file_once");/* global updateGame */
gulp_place("./game/toggleRotation.sub.js", "file_once");/* global toggleRotation */
gulp_place("./board/isOutOfBoard.sub.js", "file_once");/* global isOutOfBoard */
gulp_place("./dispatchGameEvent.sub.js", "file_once");/* global dispatchGameEvent */
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
    grid_display.addEventListener("mousedown", ({ target })=> target.parentElement.dataset.part= target.dataset.id);//propagate exact choosen part of ship
    grid_display.addEventListener("dragstart", event=> event.dataTransfer.setData("text/html", event.target.getAttribute("name")+"|"+event.target.dataset.part));
    button_rotate.onclick= ()=> toggleRotation(game, grid_display);

    document.addEventListener("game", function({ target, detail: { type, loss } }){
        let { current_player_id, players= [] }= game;
        let state= "start";
        switch (type){
            case "start":
                players.push({ name: target.getAttribute("player") });
                return updateGame(game, { players });
            case "ready":
                if(game.players.filter(({ name })=> name).length!==2) return requestAnimationFrame(dispatchGameEvent.bind(null, target, { type, loss }));
                Object.assign(game.players.find(({ name })=> name===target.getAttribute("player")), { loss });
                state= game.players.filter(({ loss })=> loss===0).length===2 ? "game" : "ready";
                break;
            case "fire":
                break;
            default :
        }
        current_player_id= current_player_id ? 0 : 1;
        updateGame(game, { state, current_player_id, players });
        updateMessages(game);
    });
    
    registerComputer(game, grid_opponent);
    registerPlayer(game, grid_user, ships);

    function updateMessages({ state, players, current_player_id }){
        const { [current_player_id]: current_player }= players;
        let message= "";
        switch (state){
            case "ready":
                message= `Prepare your fleet`;
                break;
            case "game":
                message= `Fire to your opponent!`;
                break;
            default :
        }
        display_turn.textContent= current_player.name+" Go:";
        display_info.textContent= message;
    }
}