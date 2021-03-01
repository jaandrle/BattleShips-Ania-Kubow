gulp_place("../registerPlayer.sub.js", "file_once");/* global registerPlayer */
gulp_place("./BoardInterface.sub.js", "file_once");/* global BoardInterface */

window.customElements.define("g-battleships-localplayer", class extends BoardInterface{
    handleEvent({ detail: { type, grid_el, game, ships } }){
        switch (type){
            case "start": return registerPlayer(game, grid_el, ships);
            default :
        }
    }
    constructor(){ super(); }
});
