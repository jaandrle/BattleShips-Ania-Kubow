/* parent *//* global HTMLBattleShipsElement */
/** @param {game} def */
HTMLBattleShipsElement.prototype.updateMessages= function({ state, players, current_player_id }){
    const { [current_player_id]: current_player }= players;
    let message= "";
    let title= current_player.name+" Go:";
    switch (state){
        case "ready":
            message= `Prepare your fleet`;
            break;
        case "game":
            message= `Fire to your opponent!`;
            break;
        case "end":
            const opponent_player= players[current_player_id?0:1];
            message= `(${current_player.name}) ${opponent_player.loss}:${current_player.loss} (${opponent_player.name})`;
            title= "Final score:";
            break;
    }
    this.shadowRoot.getElementById("whose-go").textContent= title;
    this.shadowRoot.getElementById("info").textContent= message;
};