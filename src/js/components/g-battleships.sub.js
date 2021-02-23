gulp_place("./getBattleShipsTemplate.sub.js", "file_once");/* global getBattleShipsTemplate */
gulp_place("./createElement.sub.js", "file_once");/* global createElement */
gulp_place("../game/createGameConfig.sub.js", "file_once");/* global createGameConfig */
gulp_place("../ship/createShip.sub.js", "file_once");/* global createShip */
gulp_place("../game/toggleRotation.sub.js", "file_once");/* global toggleRotation */
gulp_place("../game/updateGame.sub.js", "file_once");/* global updateGame */
gulp_place("../dispatchGameEvent.sub.js", "file_once");/* global dispatchGameEvent */
gulp_place("../game/fireDetection.sub.js", "file_once");/* global fireDetection */

const _private= new WeakMap();
window.customElements.define("g-battleships", class extends HTMLElement{
    log(){
        console.log(_private.get(this)); /* jshint devel: true *///gulp.keep.line
    }
    connectedCallback(){
        const [ size, squares ]= [ "size", "squares" ].map(n=> this.getAttribute(n));
        const width= Math.sqrt(squares);
        const el_this= this.shadowRoot;
        
        this.registerStyles({ innerHTML: `:host{ --size-board: ${size}; --size-square: calc( var(--size-board) / ${width} ); }` });
        el_this.appendChild(getBattleShipsTemplate());
        const [ grid_user, grid_opponent, grid_display ]= [ "user", "opponent", "display" ].map(name=> el_this.querySelector(".grid-"+name));
        const button_rotate= el_this.getElementById("rotate");
        
        const game= createGameConfig({ width, grid_user, grid_opponent });
        _private.set(this, game);
        
        grid_display.addEventListener("mousedown", ({ target })=> target!==grid_display && (target.parentElement.dataset.part= target.dataset.id));//propagate exact choosen part of ship
        grid_display.addEventListener("dragstart", event=> event.dataTransfer.setData("text/html", event.target.getAttribute("name")+"|"+event.target.dataset.part));
        button_rotate.onclick= ()=> toggleRotation(game, grid_display);
        
        this.addEventListener("game", this);
    }
    handleEvent({ type: event, target, detail: { type, loss } }){
        if(event!=="game") return false;
        if(type==="message") return false;
        /** @type {game} */
        const game= _private.get(this);
        let { current_player_id, players= [] }= game;
        let state= "start";
        switch (type){
            case "start": return false;
            case "ready":
                if(game.players.filter(({ name })=> name).length!==2) return setTimeout(dispatchGameEvent, 250, target, { type, loss });
                current_player_id= game.players.findIndex(({ name })=> name===target.getAttribute("player"));
                Object.assign(game.players[current_player_id], { loss });
                state= game.players.filter(({ loss })=> loss===0).length===2 ? "game" : "ready";
                break;
            case "fire":
                state= "game";
                break;
            default :
        }
        current_player_id= current_player_id ? 0 : 1;
        updateGame(game, { state, current_player_id, players });
        this.updateMessages(game);
        if(state==="game") this.nextRound();
    }
    nextRound(){
        /** @type {game} */
        const game= _private.get(this);
        const { current_player_id, players }= game;
        const { [current_player_id]: current_player, [current_player_id ? 0 : 1]: current_opponent }= players;
        const el_this= this.shadowRoot;
        el_this.querySelector(".grid-"+current_player.player).onclick= null;
        el_this.querySelector(".grid-"+current_opponent.player).onclick= fireDetection;
        dispatchGameEvent(el_this, { type: "message", player: current_player.player, game });
    }
    updateMessages({ state, players, current_player_id }){
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
        this.shadowRoot.getElementById("whose-go").textContent= current_player.name+" Go:";
        this.shadowRoot.getElementById("info").textContent= message;
    }
    registerStyles({ href, innerHTML }){
        return this.shadowRoot.appendChild(
            href ?
            createElement("link", { rel: "stylesheet", href }) :
            createElement("style", { innerHTML })
        );
    }
    /**
     * @param {HTMLElement} el 
     */
    registerBoard(el){
        const [ name, player ]= [ "name", "player" ].map(n=> el.getAttribute(n));
        /** @type {game} */
        const game= _private.get(this);
        const grid_el= this.shadowRoot.querySelector(".grid-"+player);
        grid_el.setAttribute("player", name);
        game.players.push({ name, player });
        dispatchGameEvent(this.shadowRoot, { type: "start", game, ships: this.shadowRoot.querySelector(".grid-display").getElementsByClassName("ship"), grid_el });
    }
    /**
     * @param {string} name Ship name
     * @param {number} length Ship size
     */
    registerShip(name, length){
        const ship_el= createElement("div", { name, className: "ship", draggable: true });
        Array.from({ length }).forEach((_, id)=> ship_el.appendChild(createElement("div", { dataset: { id } })));
        this.shadowRoot.querySelector(".grid-display").appendChild(ship_el);

        /** @type {game} */
        const game= _private.get(this);
        game.types_ships.push(createShip(name, length, game.width));
    }
    addEventListener(...args){ return this.shadowRoot.addEventListener(...args); }
    dispatchEvent(...args){ return this.shadowRoot.dispatchEvent(...args); }
    constructor(){ super(); this.attachShadow({ mode: "open" }); }
});