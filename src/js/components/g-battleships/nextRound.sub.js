/* parent *//* global HTMLBattleShipsElement, _private */
gulp_place("../../game/fireDetection.sub.js", "file_once");/* global fireDetection */
gulp_place("../../dispatchGameEvent.sub.js", "file_once");/* global dispatchGameEvent */
HTMLBattleShipsElement.prototype.nextRound= function(){
    const game= _private.get(this);
    const { current_player_id, players }= game;
    const { [current_player_id]: current_player, [current_player_id ? 0 : 1]: current_opponent }= players;
    const el_this= this.shadowRoot;
    el_this.querySelector(".grid-"+current_player.player).onclick= null;
    el_this.querySelector(".grid-"+current_opponent.player).onclick= fireDetection;
    dispatchGameEvent(el_this, { type: "message", current_player_id, game });
};