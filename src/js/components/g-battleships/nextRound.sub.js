/* parent *//* global HTMLBattleShipsElement, _private */
gulp_place("../../game/fireDetection.sub.js", "file_once");/* global fireDetection */
gulp_place("../../dispatchGameEvent.sub.js", "file_once");/* global dispatchGameEvent */
/**
 * @fires game
 */
HTMLBattleShipsElement.prototype.nextRound= function(){
    const game= _private.get(this);
    const { current_player_id, players }= game;
    const el_this= this.shadowRoot;
    players.forEach(({ player }, i)=>
        ( el_this.querySelector(".grid-"+player).onclick= current_player_id!==i ? fireDetection : null ));
    dispatchGameEvent(el_this, { type: "round-start", current_player_id, game });
};