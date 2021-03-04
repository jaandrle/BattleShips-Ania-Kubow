gulp_place("../math_utils.sub.js", "file_once");/* global randomIntegerTill */
gulp_place("../board/isNotInRightBorder.sub.js", "file_once");/* global isNotInRightBorder */
gulp_place("../registerComputer.sub.js", "file_once");/* global registerComputer */
gulp_place("./BoardInterface.sub.js", "file_once");/* global BoardInterface */

window.customElements.define("g-battleships-computerplayer", class extends BoardInterface{
    /**
     * @param {GameEvent} def
     * @listens game
     * @fires fire
     * */
    handleEvent({ detail: { type, grid_el, game, ships, current_player_id, ship_id, square_id, remains } }){
        if(this._isCurrentPlayer(current_player_id)===0) return false;
        switch (type){
            case "start": return registerComputer(game, grid_el, ships);
            case "round-start": return this._firePreparation(game.boards.user, game);
            case "round-end": return this._fireEnd(ship_id, square_id, remains);
            default :
        }
    }
    _fire(target, id){ return target[id].dispatchEvent(new Event("click", { bubbles: true })); }
    /**
     * @param {HTMLElement[]} targets 
     * @param {game}
     */
    _firePreparation(targets, { count_squares, width }){
        if(!this._prev_tries) return this._fire(targets, randomIntegerTill(count_squares));
        
        const prev_tries= this._prev_tries;
        const prev_success= Array.isArray(this._prev_success) ? this._prev_success : [];
        if(!prev_success.length) return this._fire(targets, randomIntegerFilterTill(count_squares, prev_tries));
        
        const next= [ width, -width, 1, -1 ].sort(()=> Math.random() - 0.5).map(v=> v+prev_success[0].id).find(v=> {
            if(prev_tries.indexOf(v)!==-1 || v<0||v>count_squares-1) return false; //easy
            if(isNotInRightBorder(v, width)!==isNotInRightBorder(prev_success[0].id, width)) return false;
            return true;
        });
        prev_success.push(prev_success.shift());
        if(next) return this._fire(targets, next);
        
        return this._fire(targets, randomIntegerFilterTill(count_squares, prev_tries));
    }
    _fireEnd(ship_id, square_id, remains){
        const prev_tries= this._prev_tries ? this._prev_tries : [];
        this._prev_tries= prev_tries.concat(square_id);
        if(typeof ship_id==="undefined") return false;

        this._prev_success= ( Array.isArray(this._prev_success) ? this._prev_success : [] ).concat({ ship_id, id: square_id });
        if(remains) return true;
        
        this._prev_success= this._prev_success.filter(({ ship_id: i })=> i!==ship_id);
    }
    constructor(){ super(); }
});

/**
 * @param {number} max 
 * @param {number[]} filter_array 
 */
function randomIntegerFilterTill(max, filter_array){
    let out;
    do {
        out= randomIntegerTill(max);
    } while (filter_array.indexOf(out)!==-1);
    return out;
}