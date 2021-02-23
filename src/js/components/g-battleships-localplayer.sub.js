gulp_place("../registerPlayer.sub.js", "file_once");/* global registerPlayer */

window.customElements.define("g-battleships-localplayer", class extends HTMLElement{
    connectedCallback(){
        this.parentElement.addEventListener("game", this);
        this.parentElement.registerBoard(this);
    }
    handleEvent({ detail: { type, grid_el, game, ships } }){
        switch (type){
            case "start": return registerPlayer(game, grid_el, ships);
            default :
        }
    }
    constructor(){ super(); }
});