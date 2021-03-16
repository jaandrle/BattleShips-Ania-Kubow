(function BattleShipsModule(){
    const { floor, abs, random }= Math;
    const randomIntegerTill= max=> floor(random()*max);
    /**
     * @param {number} n_coordinate 
     * @param {number} width 
     * @returns {0|1} Laying in right border area (0 ⇔ nth coodinate is in right border)
     */
    function isNotInRightBorder(n_coordinate, width){
        return (n_coordinate+1)%width ? 1 : 0;
    }


    /**
     * @typedef player
     * @type {object}
     * @property {string} name Player name
     * @property {string} player Player type
     * @property {number} loss
     */
    /**
     * @typedef game
     * @type {object}
     * @property {"start"|"ready"|"game"|"end"} state Game state
     * @property {number} width Game width/height
     * @property {number} count_squares All squares count (width^2)
     * @property {0|1} player_ships_rotation Horizontal/verical
     * @property {ship[]} types_ships
     * @property {results[]} results Array of results per `players` (in the same order) and `types_ships` ⇒ `[ [].length===types_ships.length, … ].length===players.length`
     * @property {{ user: HTMLDivElement[], opponent: HTMLDivElement[] }} boards
     * @property {0|1} current_player_id
     * @property {number} max_score
     * @property {player[]} players
     */
    /**
     * @param {ship_coordinates} coordinates
     * @param {number} start
     * @param {game} game
     */
    function isOutOfBoard(coordinates, { width, count_squares }){
        const l= coordinates.length-1;
        let m;
        //#1: Math → converting coordinates into array of 1 or zeroes
        //  ⇒ so allowed combinations: all 1, all 0 or 1 with last item 0 (ship ends on right border)
        return coordinates.some((i, j)=> {
            if(!j) m= isNotInRightBorder(i, width);//#1
            if(i<0||i>count_squares-1) return true;//easy ;-)
            if(!j) return false;
            return ( isNotInRightBorder(i, width) || ( j===l ? m : 0 ) )!==m;//#1
        });
    }
    /**
     * @typedef ship
     * @type {object}
     * @property {string} name
     * @property {number} length
     * @property {ship_coordinates[]} directions Horizontal/Vertical ship coordinates
     */

    /**
     * @param {ship} ship
     * @param {HTMLDivElement[]} squares generated boards `div`s
     * @param {game} game
     */
    function computersShip(ship, game){
        const direction_index= randomIntegerTill(ship.directions.length);
        const direction= direction_index ? game.width : 1;
    
        const start= abs( randomIntegerTill(game.count_squares) - ship.length * direction );
        const current= ship.directions[direction_index].map(i=> i+start);
        const board= game.boards.opponent;
        
        if(isOutOfBoard(current, game) || /* is_taken */current.some(i=> board[i].hasAttribute("name")))
            return computersShip(ship, game);
    
        const name= ship.name;
        current.forEach(i=> board[i].setAttribute("name", name));
    }
    /**
     * @typedef GameEventData
     * @type {GED_fire|GED_game|GED_roundEnd|GED_roundStart}
     */
    /**
     * @typedef GED_fire
     * @type {object}
     * @property {"fire"} type
     * @property {boolean} loss
     * @property {number} square Fire target
     */
    /**
     * @typedef GED_game
     * @type {object}
     * @property {"start"|"ready"|"end"} type
     * @property {HTMLElement} grid_el
     * @property {game} game
     * @property {ship[]} ships
     */
    /**
     * @typedef GED_roundStart
     * @type {object}
     * @property {"round-start"} type
     */
    /**
     * @typedef GED_roundEnd
     * @type {object}
     * @property {"round-end"} type
     * @property {number} current_player_id
     * @property {boolean} loss
     */
    /**
     * @typedef GameEvent
     * @type {object}
     * @property {HTMLDivElement} target
     * @property {string} type
     * @property {GameEventData} detail
     */
    /**
     * @param {HTMLElement} target
     * @param {GameEventData} detail `detail` key for `CustomEvent`
     */
    function dispatchGameEvent(target, detail){
        return target.dispatchEvent(new CustomEvent("game", { detail, bubbles: true }));
    }
    /**
     * @type {EventListener}
     * @param {Event} event
     * @this HTMLElement
     * @fires game
     * @listens fire
     */
    function fireDetection({ target }){
        target.classList.add("uncover");
        dispatchGameEvent(this, {
            type: "fire",
            loss: target.hasAttribute("name") ? target.getAttribute("name") : false,
            square: parseInt(target.dataset.id)
        });
    }


    /**
     * @param {game} game
     * @param {HTMLElement} grid_opponent
     * @fires game
     */
    function registerComputer(game, grid_opponent){
        grid_opponent.classList.add("fog");
        game.types_ships.forEach(ship_type=> computersShip(ship_type, game));
        dispatchGameEvent(grid_opponent, { type: "ready", loss: 0 });
    }
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
            return typeof player_id_candidate==="undefined" ? -1 : Number(this._player_id===player_id_candidate);
        }
        constructor(){ super(); }
    }
    
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



    /**
     * @param {game} game
     * @param {HTMLElement} grid_user
     * @param {HTMLDivElement[]} ships
     * @fires game
     */
    function registerPlayer(game, grid_user, ships){
        let player_ships_done= 0;
        grid_user.addEventListener("dragover", event=> event.preventDefault(), false);//to `drop` allow
        grid_user.addEventListener("drop", function(event){
            const [ ship_type_name, part ]= event.dataTransfer.getData("text/html").split("|");
            const { player_ships_rotation, boards: { user }, width }= game;
            const { directions }= game.types_ships.find(({ name })=> name===ship_type_name);
            const start= parseInt(event.target.dataset.id) - parseInt(part) * ( player_ships_rotation ? width : 1 );
            const coordinates= directions[player_ships_rotation].map(i=> i+start);
            
            if(isOutOfBoard(coordinates, game)) return false;
            if(coordinates.some(i=> user[i].hasAttribute("name"))) return false;
    
            coordinates.forEach(i=> user[i].setAttribute("name", ship_type_name));
            ships[ship_type_name].dataset.used= 1;
            player_ships_done+= 1;
            if(player_ships_done===game.types_ships.length) dispatchGameEvent(grid_user, { type: "ready", loss: 0 });
        }, false);
    }

    
    window.customElements.define("g-battleships-localplayer", class extends BoardInterface{
        /**
         * @param {GameEventData} def
         * @listens game
         */
        handleEvent({ detail: { type, grid_el, game, ships } }){
            switch (type){
                case "start": return registerPlayer(game, grid_el, ships);
                default :
            }
        }
        constructor(){ super(); }
    });
    
    window.customElements.define("g-battleships-ship", class extends HTMLElement{
        connectedCallback(){
            const name= this.getAttribute("name");
            const size= parseInt(this.getAttribute("size"));
            this.parentElement.registerShip(name, size);
        }
        constructor(){ super(); }
    });
    window.customElements.define("g-battleships-styles", class extends HTMLElement{
        connectedCallback(){
            if(!this.hasAttribute("href")) return this.parentElement.registerStyles({ innerHTML: this.innerHTML });
            else return this.parentElement.registerStyles({ href: this.getAttribute("href") });
        }
        constructor(){ super(); }
    });
    /** @type {WeakMap<HTMLBattleShipsElement,game>} */
    const _private= new WeakMap();
    class HTMLBattleShipsElement extends HTMLElement{
        addEventListener(...args){ return this.shadowRoot.addEventListener(...args); }
        dispatchEvent(...args){ return this.shadowRoot.dispatchEvent(...args); }
        constructor(){
            super();
            this.attachShadow({ mode: "open" });
            this.addEventListener("game", this);
        }
    }
    const template_id= "g-battleships";
    /**
     * @returns {DocumentFragment}
     */
    function getBattleShipsTemplate(){
        let template= document.getElementById(template_id);
        if(!template){
            template= Object.assign(document.createElement("template"), {
                id: template_id,
                innerHTML: `
        <div class="container">
            <div class="grid grid-user"></div>
            <div class="grid grid-opponent"></div>
        </div>
        <div class="hidden-info">
            <h3 id="whose-go">Your Go</h3>
            <h3 id="info"></h3>
            <button id="rotate">Rotate Your Ships</button>
        </div>
        <div class="grid-display">
        </div>
    `
            });
            document.body.appendChild(template);
        }
        return template.content.cloneNode(true);
    }
    /**
     * In case 3×3 and ship with length of 3 (calculates thanks to `shift`~board width):
     * 
     * | 012 |    | 037 |
     * |-----|----|-----|
     * | xxx |    | x00 |
     * | 000 | OR | x00 |
     * | 000 |    | x00 |
     * @typedef ship_coordinates
     * @type {number[]}
     */
    /**
     * Generates ship coordinates
     * @param {number} length
     * @param {number} shift
     * @returns {ship_coordinates}
     */
    function getShipCoordinates(length, shift= 1){
        return Array.from({ length }).map((_, i)=> i*shift);
    }

    /**
     * @param {string} name
     * @param {number} length
     * @param {number} width_board
     * @returns {ship}
     */
    function createShip(name, length, width_board) {
        return { name, length, directions: [ getShipCoordinates(length, 1), getShipCoordinates(length, width_board) ] };
    }
    
    /**
     * Creates `div` element with `dataset.id` based on given `id`
     * @param {number} id
     * @returns {HTMLDivElement}
     */
    function createBoardDiv(id){
        const div= document.createElement("div");
        Object.assign(div.dataset, { id });
        return div;
    }
    /**
     * Fills given board `target_el` with squares (see returned `div`s)
     * @param {HTMLDivElement} target_el 
     * @param {number} length Overall count of games squares
     * @returns {HTMLDivElement[]}
     */
    function createBoard(target_el, length){
        return Array.from({ length })
            .map((_, i)=> target_el.appendChild(createBoardDiv(i)));
    }

    /**
     * @param {number} width Squares number per width/height of boards
     * @returns {game}
     */
    function createGameConfig({ width, grid_user, grid_opponent }){
        const count_squares= width*width;
        return {
            state: "start",
            width, count_squares,
            player_ships_rotation: 0,
            types_ships: [ ],
            results: [ ],
            boards: {
                user: createBoard(grid_user, count_squares),
                opponent: createBoard(grid_opponent, count_squares)
            },
            current_player_id: 0,
            max_score: 0,
            players: []
        };
    }

    /**
     * @param {game} game
     * @param {HTMLElement} grid_display
     */
    function toggleRotation(game, grid_display){
        const player_ships_rotation= game.player_ships_rotation ? 0 : 1;
        grid_display.dataset.rotated= player_ships_rotation;
        Object.assign(game, { player_ships_rotation });
    }
    HTMLBattleShipsElement.prototype.connectedCallback= function(){
        const [ size, squares ]= [ "size", "squares" ].map(n=> this.getAttribute(n));
        const width= Math.sqrt(squares);
        const el_this= this.shadowRoot;
        
        this.registerStyles({ innerHTML: `:host{ --size-board: ${size}; --size-square: calc( var(--size-board) / ${width} ); }` });
        el_this.appendChild(getBattleShipsTemplate());
        const [ grid_user, grid_opponent, grid_display ]= [ "user", "opponent", "display" ].map(name=> el_this.querySelector(".grid-"+name));
        const button_rotate= el_this.getElementById("rotate");
        
        const game= createGameConfig({ width, grid_user, grid_opponent });
        _private.set(this, game);
        
        grid_display.addEventListener("mousedown", ({ target })=> target!==grid_display && (target.parentElement.dataset.part= target.dataset.id));//propagate exact choosen part of ship
        grid_display.addEventListener("dragstart", event=> event.dataTransfer.setData("text/html", event.target.getAttribute("name")+"|"+event.target.dataset.part));
        button_rotate.onclick= ()=> toggleRotation(game, grid_display);
    };

    /**
     * @param {game} game
     * @param {object} new_data
     */
    function updateGame(game, new_data){
        Object.assign(game, new_data);
    }


    /**
     * Deleguje na metody {@link HTMLBattleShipsElement._ongamefire} a {@link HTMLBattleShipsElement._ongameready}
     * @param {GameEvent} def
     * @fires game
     * @listens game
     * */
    HTMLBattleShipsElement.prototype.handleEvent= function({ type: event, target, detail: { type, loss, square } }){
        if(event!=="game"||type==="round-start"||type==="start") return false;
        const game= _private.get(this);
        /**
         * Změněné klíče k {@link game}
         * @typedef game_update
         * @type {game|{}&{ current_player_id, state }}
         */
        /** @type {game_update} */
        const game_update= Reflect.has(this, "_ongame"+type) ?
            this["_ongame"+type].call(this, target, { type, loss, square }, game) :
            { current_player_id: game.current_player_id, state: type };
        game_update.current_player_id= game_update.current_player_id ? 0 : 1;
        updateGame(game, game_update);
        this.updateMessages(game);
        if(game.state==="game") return this.nextRound();
        if(game.state!=="end") return false;
    
        game.players.forEach(({ player })=>
            ( this.shadowRoot.querySelector(".grid-"+player).onclick= null ));
    };
    /**
     * @param {HTMLDivElement} [target]
     * @param {GameEventData} detail
     * @param {game} game
     * @returns {game_update}
     */
    HTMLBattleShipsElement.prototype._ongamefire= function(
        target,
        { square, loss },
        { current_player_id, players= [], types_ships, results }
    ){
        const out= { state: "game", current_player_id };
        const main_event_data= { type: "round-end", current_player_id, square_id: square };
        if(!loss){
            dispatchGameEvent(this.shadowRoot, main_event_data);
            return out;
        }
        const opponent_player_id= current_player_id ? 0 : 1;
        const ship_id= types_ships.findIndex(s=> s.name===loss);
        results[opponent_player_id][ship_id]-= 1;
        players[opponent_player_id].loss+= 1;
        Object.assign(out, { results, players });
        if(results[opponent_player_id].filter(Boolean).length){
            dispatchGameEvent(this.shadowRoot, Object.assign(main_event_data, {
                ship_id, remains: results[opponent_player_id][ship_id]
            }));
            return out;
        }
        
        out.state= "end";
        dispatchGameEvent(this.shadowRoot, { type: "end", winner: current_player_id });
        return out;
    };
    /**
     * @param {HTMLDivElement} target
     * @param {GameEventData} detail
     * @param {game} game
     * @returns {game_update}
     */
    HTMLBattleShipsElement.prototype._ongameready= function(
        target,
        { type, loss },
        { current_player_id, players= [], types_ships }
    ){
        let state= "start";
        if(players.filter(({ name })=> name).length!==2) return setTimeout(dispatchGameEvent, 250, target, { type, loss });
        current_player_id= players.findIndex(({ name })=> name===target.getAttribute("player"));
        Object.assign(players[current_player_id], { loss });
        state= players.filter(({ loss })=> loss===0).length===2 ? "game" : "ready";
        const out= { current_player_id, state };
        if(state!=="game") return out;
    
        out.results= players.map(()=> types_ships.map(s=> s.length));
        return out;
    };
    HTMLBattleShipsElement.prototype.log= function(){
        console.log(_private.get(this)); /* jshint devel: true *///gulp.keep.line
    };


    /**
     * @fires game
     */
    HTMLBattleShipsElement.prototype.nextRound= function(){
        const game= _private.get(this);
        const { current_player_id, players }= game;
        const el_this= this.shadowRoot;
        players.forEach(({ player }, i)=>
            ( el_this.querySelector(".grid-"+player).onclick= current_player_id!==i ? fireDetection : null ));
        dispatchGameEvent(el_this, { type: "round-start", current_player_id, game });
    };

    /**
     * @name HTMLBattleShipsElement#registerBoard
     * @param {BoardInterface} el 
     * @returns {number} Id registration of player/board
     * @fires game
     */
    HTMLBattleShipsElement.prototype.registerBoard= function(el){
        const [ name, player ]= [ "name", "player" ].map(n=> el.getAttribute(n));
        const game= _private.get(this);
        const grid_el= this.shadowRoot.querySelector(".grid-"+player);
        grid_el.setAttribute("player", name);
        const player_id= game.players.length;
        game.players.push({ name, player });
        dispatchGameEvent(this.shadowRoot, { type: "start", game, ships: this.shadowRoot.querySelector(".grid-display").getElementsByClassName("ship"), grid_el });
        return player_id;
    };
    /**
     * @param {string} tag_name Like `link`, `style`, `div`, …
     * @param {object|null} def 
     * @returns {HTMLElement} An elemenet based on `tyg_name`
     */
    function createElement(tag_name, def){
        const el= document.createElement(tag_name);
        Object.keys(def).forEach(n=> {
            switch (n){
                case "name": el.setAttribute(n, def[n]); break;
                case "dataset": Object.assign(el.dataset, def.dataset); break;
                default : el[n]= def[n];
            }
        });
        return el;
    }

    /**
     * @param {string} name Ship name
     * @param {number} length Ship size
     */
    HTMLBattleShipsElement.prototype.registerShip= function(name, length){
        const ship_el= createElement("div", { name, className: "ship", draggable: true });
        Array.from({ length }).forEach((_, id)=> ship_el.appendChild(createElement("div", { dataset: { id } })));
        this.shadowRoot.querySelector(".grid-display").appendChild(ship_el);
    
        const game= _private.get(this);
        game.max_score+= length;
        game.types_ships.push(createShip(name, length, game.width));
    };

    HTMLBattleShipsElement.prototype.registerStyles= function({ href, innerHTML }){
        return this.shadowRoot.appendChild(
            href ?
            createElement("link", { rel: "stylesheet", href }) :
            createElement("style", { innerHTML })
        );
    };
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
    window.customElements.define("g-battleships", HTMLBattleShipsElement);
})();