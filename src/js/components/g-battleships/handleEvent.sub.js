/* parent *//* global HTMLBattleShipsElement, _private */
gulp_place("../../game/updateGame.sub.js", "file_once");/* global updateGame */
gulp_place("../../dispatchGameEvent.sub.js", "file_once");/* global dispatchGameEvent */
gulp_place("../../GameEventData.type.sub.js", "file_once");
/**
 * Delegate to methods {@link HTMLBattleShipsElement._ongamefire} and {@link HTMLBattleShipsElement._ongameready}.
 * @param {GameEvent} def
 * @fires game
 * @listens game
 * */
HTMLBattleShipsElement.prototype.handleEvent= function({ type: event, target, detail: { type, loss, square } }){
    if(event!=="game"||type==="round-start"||type==="start") return false;
    const game= _private.get(this);
    /**
     * Only updated keys for {@link game}
     * @typedef game_update
     * @type {game|{}&{ current_player_id, state }}
     */
    /** @type {game_update} */
    const game_update= Reflect.has(this, "_ongame"+type) ?
        this["_ongame"+type].call(this, target, { type, loss, square }, game) :
        { current_player_id: game.current_player_id, state: type };
    game_update.current_player_id= game_update.current_player_id ? 0 : 1;
    updateGame(game, game_update);
    this.updateMessages(game);
    if(game.state==="game") return this.nextRound();
    if(game.state!=="end") return false;

    game.players.forEach(({ player })=>
        ( this.shadowRoot.querySelector(".grid-"+player).onclick= null ));
};
/**
 * @param {HTMLDivElement} [target]
 * @param {GameEventData} detail
 * @param {game} game
 * @returns {game_update}
 */
HTMLBattleShipsElement.prototype._ongamefire= function(
    target,
    { square, loss },
    { current_player_id, players= [], types_ships, results }
){
    const out= { state: "game", current_player_id };
    const main_event_data= { type: "round-end", current_player_id, square_id: square };
    if(!loss){
        dispatchGameEvent(this.shadowRoot, main_event_data);
        return out;
    }
    const opponent_player_id= current_player_id ? 0 : 1;
    const ship_id= types_ships.findIndex(s=> s.name===loss);
    results[opponent_player_id][ship_id]-= 1;
    players[opponent_player_id].loss+= 1;
    Object.assign(out, { results, players });
    if(results[opponent_player_id].filter(Boolean).length){
        dispatchGameEvent(this.shadowRoot, Object.assign(main_event_data, {
            ship_id, remains: results[opponent_player_id][ship_id]
        }));
        return out;
    }
    
    out.state= "end";
    dispatchGameEvent(this.shadowRoot, { type: "end", winner: current_player_id });
    return out;
};
/**
 * @param {HTMLDivElement} target
 * @param {GameEventData} detail
 * @param {game} game
 * @returns {game_update}
 */
HTMLBattleShipsElement.prototype._ongameready= function(
    target,
    { type, loss },
    { current_player_id, players= [], types_ships }
){
    let state= "start";
    if(players.filter(({ name })=> name).length!==2) return setTimeout(dispatchGameEvent, 250, target, { type, loss });
    current_player_id= players.findIndex(({ name })=> name===target.getAttribute("player"));
    Object.assign(players[current_player_id], { loss });
    state= players.filter(({ loss })=> loss===0).length===2 ? "game" : "ready";
    const out= { current_player_id, state };
    if(state!=="game") return out;

    out.results= players.map(()=> types_ships.map(s=> s.length));
    return out;
};