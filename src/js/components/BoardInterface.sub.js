class BoardInterface extends HTMLElement{
    connectedCallback(){
        this.parentElement.addEventListener("game", this);
        /** @type {number} IDcko prehravace */
        this._player_id= this.parentElement.registerBoard(this);
    }
    constructor(){ super(); }
}