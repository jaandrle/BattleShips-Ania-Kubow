/* parent *//* global HTMLBattleShipsElement, _private */
gulp_place("../../game/updateGame.sub.js", "file_once");/* global updateGame */
gulp_place("../../dispatchGameEvent.sub.js", "file_once");/* global dispatchGameEvent */
gulp_place("../../GameEventData.type.sub.js", "file_once");
/**
 * @param {GameEvent} def
 * @fires game
 * @listens game
 * */
HTMLBattleShipsElement.prototype.handleEvent= function({ type: event, target, detail: { type, loss } }){
    if(event!=="game") return false;
    if(type==="round-start") return false;
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
            dispatchGameEvent(this.shadowRoot, { type: "round-end", current_player_id, loss, target_id: target });
            break;
        default :
    }
    current_player_id= current_player_id ? 0 : 1;
    updateGame(game, { state, current_player_id, players });
    this.updateMessages(game);
    if(state==="game") this.nextRound();
};