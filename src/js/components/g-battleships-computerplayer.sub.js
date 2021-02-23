gulp_place("../math_utils.sub.js", "file_once");/* global randomIntegerTill */
gulp_place("../registerComputer.sub.js", "file_once");/* global registerComputer */

window.customElements.define("g-battleships-computerplayer", class extends HTMLElement{
    connectedCallback(){
        this.parentElement.addEventListener("game", this);
        this.parentElement.registerBoard(this);
    }
    /**
     * @param {object} def
     * @param {object} def.detail
     * @param {game} def.detail.game
     */
    handleEvent({ detail: { type, grid_el, game, ships, player } }){
        if(player&&player!==this.getAttribute("player")) return false;
        switch (type){
            case "start": return registerComputer(game, grid_el, ships);
            case "message": return game.boards.user[randomIntegerTill(game.count_squares)].dispatchEvent(new Event("click"));
            default :
        }
    }
    constructor(){ super(); }
});