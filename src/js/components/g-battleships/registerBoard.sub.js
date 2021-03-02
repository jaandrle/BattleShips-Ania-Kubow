/* parent *//* global HTMLBattleShipsElement, _private */
gulp_place("../../dispatchGameEvent.sub.js", "file_once");/* global dispatchGameEvent */
/**
 * @name HTMLBattleShipsElement#registerBoard
 * @param {BoardInterface} el 
 * @returns {number} Id registration of player/board
 * @fires game
 */
HTMLBattleShipsElement.prototype.registerBoard= function(el){
    const [ name, player ]= [ "name", "player" ].map(n=> el.getAttribute(n));
    const game= _private.get(this);
    const grid_el= this.shadowRoot.querySelector(".grid-"+player);
    grid_el.setAttribute("player", name);
    const player_id= game.players.length;
    game.players.push({ name, player });
    dispatchGameEvent(this.shadowRoot, { type: "start", game, ships: this.shadowRoot.querySelector(".grid-display").getElementsByClassName("ship"), grid_el });
    return player_id;
};