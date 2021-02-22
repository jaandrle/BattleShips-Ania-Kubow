(function BattleShipsModule(){
    const { floor, abs, random }= Math;
    const randomIntegerTill= max=> floor(random()*max);
    /**
     * @typedef player
     * @type {object}
     * @property {string} name Player name
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
        grid_opponent.setAttribute("player", "Computer");
        dispatchGameEvent(grid_opponent, { type: "start" });
        grid_opponent.classList.add("fog");
        game.types_ships.forEach(ship_type=> computersShip(ship_type, game));
        dispatchGameEvent(grid_opponent, { type: "ready", loss: 0 });
    }



    /**
     * @param {game} game
     * @param {HTMLElement} grid_user
     * @param {HTMLDivElement[]} ships
     */
    function registerPlayer(game, grid_user, ships){
        grid_user.setAttribute("player", "Your");
        dispatchGameEvent(grid_user, { type: "start" });
        let player_ships_todo= game.types_ships.length;
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
            player_ships_todo-= 1;
            if(!player_ships_todo) dispatchGameEvent(grid_user, { type: "ready", loss: 0 });
        }, false);
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
            types_ships: [
                createShip("destroyer", 2, width),
                createShip("submarine", 3, width),
                createShip("cruiser", 3, width),
                createShip("battleship", 4, width),
                createShip("carrier", 5, width)
            ],
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
     * @param {object} new_data
     */
    function updateGame(game, new_data){
        Object.assign(game, new_data);
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
     * @typedef fire_data
     * @type {object}
     * @property {object} detail
     * @property {string} detail.player Player name
     * @property {boolean} detail.loss `player`s ship uncovered
     */
    
    function main(){
        const [ grid_user, grid_opponent, grid_display ]= [ "user", "opponent", "display" ].map(name=> document.getElementsByClassName("grid-"+name)[0]);
        const ships= document.getElementsByClassName("ship");
        const button_rotate= document.getElementById("rotate");
        const [ display_turn, display_info ]= [ "whose-go", "info" ].map(id=> document.getElementById(id));
        
        const game= createGameConfig({
            width: 10,
            grid_user, grid_opponent
        });
        document.body.setAttribute("style", `--count-squares: ${game.width};`);//sync with CSS
        grid_display.addEventListener("mousedown", ({ target })=> target.parentElement.dataset.part= target.dataset.id);//propagate exact choosen part of ship
        grid_display.addEventListener("dragstart", event=> event.dataTransfer.setData("text/html", event.target.getAttribute("name")+"|"+event.target.dataset.part));
        button_rotate.onclick= ()=> toggleRotation(game, grid_display);
    
        document.addEventListener("game", function({ target, detail: { type, loss } }){
            let { current_player_id, players= [] }= game;
            let state= "start";
            switch (type){
                case "start":
                    players.push({ name: target.getAttribute("player") });
                    return updateGame(game, { players });
                case "ready":
                    if(game.players.filter(({ name })=> name).length!==2) return requestAnimationFrame(dispatchGameEvent.bind(null, target, { type, loss }));
                    Object.assign(game.players.find(({ name })=> name===target.getAttribute("player")), { loss });
                    state= game.players.filter(({ loss })=> loss===0).length===2 ? "game" : "ready";
                    break;
                case "fire":
                    break;
                default :
            }
            current_player_id= current_player_id ? 0 : 1;
            updateGame(game, { state, current_player_id, players });
            updateMessages(game);
        });
        
        registerComputer(game, grid_opponent);
        registerPlayer(game, grid_user, ships);
    
        function updateMessages({ state, players, current_player_id }){
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
            display_turn.textContent= current_player.name+" Go:";
            display_info.textContent= message;
        }
    }
    if(document.readyState==="complete") return main();
    return document.addEventListener("DOMContentLoaded", main);
})();