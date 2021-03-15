/* jshint maxcomplexity: 12 */
/* parent *//* global HTMLBattleShipsElement, _private */
gulp_place("../../game/updateGame.sub.js", "file_once");/* global updateGame */
gulp_place("../../dispatchGameEvent.sub.js", "file_once");/* global dispatchGameEvent */
gulp_place("../../GameEventData.type.sub.js", "file_once");
/**
 * @param {GameEvent} def
 * @fires game
 * @listens game
 * */
HTMLBattleShipsElement.prototype.handleEvent= function({ type: event, target, detail: { type, loss, square } }){
    if( event!=="game" || type==="round-start" || type==="start" ) return false;
    const game= _private.get(this);
    let { current_player_id, players= [], results }= game;
    let state= "start";
    switch (type){
        case "ready":
            if(game.players.filter(({ name })=> name).length!==2) return setTimeout(dispatchGameEvent, 250, target, { type, loss });
            current_player_id= game.players.findIndex(({ name })=> name===target.getAttribute("player"));
            Object.assign(game.players[current_player_id], { loss });
            state= game.players.filter(({ loss })=> loss===0).length===2 ? "game" : "ready";
            if(state!=="game") break;

            results= players.map(()=> game.types_ships.map(s=> s.length));
            break;
        case "fire":
            state= onFire(this, current_player_id);
            break;
    }
    current_player_id= current_player_id ? 0 : 1;
    updateGame(game, { state, current_player_id, players, results });
    this.updateMessages(game);
    if(state==="game") return this.nextRound();
    
    if(state==="end")
        players.forEach(({ player })=>
            ( this.shadowRoot.querySelector(".grid-"+player).onclick= null ));

    /**
     * @param {HTMLBattleShipsElement} _this
     * @param {0|1} current_player_id
     * @returns {"game"|"end"} Zda se ještě hraje
     */
    function onFire(_this, current_player_id){
        const state_default= "game";
        const main_event_data= { type: "round-end", current_player_id, square_id: square };
        if(!loss){
            dispatchGameEvent(_this.shadowRoot, main_event_data);
            return state_default;
        }

        const opponent_player_id= current_player_id ? 0 : 1;
        const ship_id= game.types_ships.findIndex(s=> s.name===loss);
        results[opponent_player_id][ship_id]-= 1;
        players[opponent_player_id].loss+= 1;
        if(results[opponent_player_id].filter(Boolean).length){
            dispatchGameEvent(_this.shadowRoot, Object.assign(main_event_data, {
                ship_id, remains: results[opponent_player_id][ship_id]
            }));
            return state_default;
        }
        
        dispatchGameEvent(_this.shadowRoot, { type: "end", winner: current_player_id });
        return "end";
    }
};
