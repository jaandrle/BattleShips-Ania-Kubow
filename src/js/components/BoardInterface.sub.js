class BoardInterface extends HTMLElement{
    connectedCallback(){
        /** @type {HTMLBattleShipsElement} */
        const parent= this.parentElement;
        parent.addEventListener("game", this);
        /** @type {number} IDcko prehravace */
        this._player_id= parent.registerBoard(this);
    }
    /**
     * @param {number} player_id_candidate
     * @returns {-1|0|1} Unknown|no|yes
     * */
    _isCurrentPlayer(player_id_candidate){
        return typeof player_id_candidate==="undefined" ? -1 : parseInt(this._player_id===player_id_candidate);
    }
    constructor(){ super(); }
}