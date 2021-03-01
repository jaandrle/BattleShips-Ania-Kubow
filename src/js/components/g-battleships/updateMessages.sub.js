/* parent *//* global HTMLBattleShipsElement */
HTMLBattleShipsElement.prototype.updateMessages= function({ state, players, current_player_id }){
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
};