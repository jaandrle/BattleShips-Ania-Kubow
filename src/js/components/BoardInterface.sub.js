class BoardInterface extends HTMLElement{
    connectedCallback(){
        /** @type {HTMLBattleShipsElement} */
        const parent= this.parentElement;
        parent.addEventListener("game", this);
        /** @type {number} IDcko prehravace */
        this._player_id= parent.registerBoard(this);
    }
    constructor(){ super(); }
}