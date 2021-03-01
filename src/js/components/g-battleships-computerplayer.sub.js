gulp_place("../math_utils.sub.js", "file_once");/* global randomIntegerTill */
gulp_place("../registerComputer.sub.js", "file_once");/* global registerComputer */
gulp_place("./BoardInterface.sub.js", "file_once");/* global BoardInterface */

window.customElements.define("g-battleships-computerplayer", class extends BoardInterface{
    /**
     * @param {object} def
     * @param {object} def.detail
     * @param {game} def.detail.game
     */
    handleEvent({ detail: { type, grid_el, game, ships, current_player_id } }){
        if(current_player_id&&current_player_id!==this._player_id) return false;
        switch (type){
            case "start": return registerComputer(game, grid_el, ships);
            case "message": return game.boards.user[randomIntegerTill(game.count_squares)].dispatchEvent(new Event("click", { bubbles: true }));
            default :
        }
    }
    constructor(){ super(); }
});