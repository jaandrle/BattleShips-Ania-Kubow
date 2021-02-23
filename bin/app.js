(function BattleShipsModule(){
    const { floor, abs, random }= Math;
    const randomIntegerTill= max=> floor(random()*max);

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
     * @property {{ user: HTMLDivElement[], opponent: HTMLDivElement[] }} boards
     * @property {0|1} current_player_id
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
        //  ⇒ 0 ⇔ nth coodinate is in right border
        //  ⇒ so allowed combinations: all 1, all 0 or 1 with last item 0 (ship ends on right border)
        return coordinates.some((i, j)=> {
            if(!j) m= (i+1)%width ? 1 : 0;//#1
            if(i<0||i>count_squares-1) return true;//easy ;-)
            if(!j) return false;
            return ( (i+1)%width ? 1 : ( j===l ? m : 0 ) )!==m;//#1
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
     * @param {HTMLElement} target
     * @param {object} detail `detail` key for `CustomEvent`
     * @param {"start"|"ready"|"fire"|"end"} detail.type
     * @param {boolean} [detail.loss] For `fire` type
     */
    function dispatchGameEvent(target, detail){
        return target.dispatchEvent(new CustomEvent("game", { detail, bubbles: true }));
    }
    /**
     * @type {EventListener}
     * @param {Event} event
     * @this HTMLElement
     * @fires fire
     */
    function fireDetection({ target }){
        target.classList.add("uncover");
        dispatchGameEvent(this, {
            type: "fire",
            loss: target.hasAttribute("name")
        });
    }


    /**
     * @param {game} game
     * @param {HTMLElement} grid_opponent
     */
    function registerComputer(game, grid_opponent){
        grid_opponent.classList.add("fog");
        game.types_ships.forEach(ship_type=> computersShip(ship_type, game));
        dispatchGameEvent(grid_opponent, { type: "ready", loss: 0 });
    }
    
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
                case "message": return game.boards.user[randomIntegerTill(game.count_squares)].dispatchEvent(new Event("click", { bubbles: true }));
                default :
            }
        }
        constructor(){ super(); }
    });



    /**
     * @param {game} game
     * @param {HTMLElement} grid_user
     * @param {HTMLDivElement[]} ships
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
            boards: {
                user: createBoard(grid_user, count_squares),
                opponent: createBoard(grid_opponent, count_squares)
            },
            current_player: 0,
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

    /**
     * @param {game} game
     * @param {object} new_data
     */
    function updateGame(game, new_data){
        Object.assign(game, new_data);
    }


    
    const _private= new WeakMap();
    window.customElements.define("g-battleships", class extends HTMLElement{
        log(){
            console.log(_private.get(this)); /* jshint devel: true *///gulp.keep.line
        }
        connectedCallback(){
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
            
            this.addEventListener("game", this);
        }
        handleEvent({ type: event, target, detail: { type, loss } }){
            if(event!=="game") return false;
            if(type==="message") return false;
            /** @type {game} */
            const game= _private.get(this);
            let { current_player_id, players= [] }= game;
            let state= "start";
            switch (type){
                case "start": return false;
                case "ready":
                    if(game.players.filter(({ name })=> name).length!==2) return setTimeout(dispatchGameEvent, 250, target, { type, loss });
                    current_player_id= game.players.findIndex(({ name })=> name===target.getAttribute("player"));
                    Object.assign(game.players[current_player_id], { loss });
                    state= game.players.filter(({ loss })=> loss===0).length===2 ? "game" : "ready";
                    break;
                case "fire":
                    state= "game";
                    break;
                default :
            }
            current_player_id= current_player_id ? 0 : 1;
            updateGame(game, { state, current_player_id, players });
            this.updateMessages(game);
            if(state==="game") this.nextRound();
        }
        nextRound(){
            /** @type {game} */
            const game= _private.get(this);
            const { current_player_id, players }= game;
            const { [current_player_id]: current_player, [current_player_id ? 0 : 1]: current_opponent }= players;
            const el_this= this.shadowRoot;
            el_this.querySelector(".grid-"+current_player.player).onclick= null;
            el_this.querySelector(".grid-"+current_opponent.player).onclick= fireDetection;
            dispatchGameEvent(el_this, { type: "message", player: current_player.player, game });
        }
        updateMessages({ state, players, current_player_id }){
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
        }
        registerStyles({ href, innerHTML }){
            return this.shadowRoot.appendChild(
                href ?
                createElement("link", { rel: "stylesheet", href }) :
                createElement("style", { innerHTML })
            );
        }
        /**
         * @param {HTMLElement} el 
         */
        registerBoard(el){
            const [ name, player ]= [ "name", "player" ].map(n=> el.getAttribute(n));
            /** @type {game} */
            const game= _private.get(this);
            const grid_el= this.shadowRoot.querySelector(".grid-"+player);
            grid_el.setAttribute("player", name);
            game.players.push({ name, player });
            dispatchGameEvent(this.shadowRoot, { type: "start", game, ships: this.shadowRoot.querySelector(".grid-display").getElementsByClassName("ship"), grid_el });
        }
        /**
         * @param {string} name Ship name
         * @param {number} length Ship size
         */
        registerShip(name, length){
            const ship_el= createElement("div", { name, className: "ship", draggable: true });
            Array.from({ length }).forEach((_, id)=> ship_el.appendChild(createElement("div", { dataset: { id } })));
            this.shadowRoot.querySelector(".grid-display").appendChild(ship_el);
    
            /** @type {game} */
            const game= _private.get(this);
            game.types_ships.push(createShip(name, length, game.width));
        }
        addEventListener(...args){ return this.shadowRoot.addEventListener(...args); }
        dispatchEvent(...args){ return this.shadowRoot.dispatchEvent(...args); }
        constructor(){ super(); this.attachShadow({ mode: "open" }); }
    });
})();