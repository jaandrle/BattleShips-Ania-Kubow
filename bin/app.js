/* jshint esversion: 6,-W097, -W040, browser: true, expr: true, undef: true */
(function BattleShipsModule(){
    const { floor, abs, random }= Math;
    const randomIntegerTill= max=> floor(random()*max);

    if(document.readyState==="complete") return main();
    return document.addEventListener("DOMContentLoaded", main);
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
        
        registerComputer(game, grid_opponent);
        display_info.textContent= "Prepare your fleet!";
        game.onbeforegame.push(()=> display_info.textContent= "Now you can fires to computer!");

        grid_display.addEventListener("mousedown", ({ target })=> target.parentElement.dataset.part= target.dataset.id);//propagate exact choosen part of ship
        grid_display.addEventListener("dragstart", event=> event.dataTransfer.setData("text/html", event.target.getAttribute("name")+"|"+event.target.dataset.part));
        grid_user.addEventListener("dragover", event=> event.preventDefault(), false);//to `drop` allow
        grid_user.addEventListener("drop", function(event){
            const [ ship_type_name, part ]= event.dataTransfer.getData("text/html").split("|");
            const { player_ships_rotation, player_ships_todo, boards: { user }, width }= game;
            const { directions }= game.types_ships.find(({ name })=> name===ship_type_name);
            const start= parseInt(event.target.dataset.id) - parseInt(part) * ( player_ships_rotation ? width : 1 );
            const coordinates= directions[player_ships_rotation].map(i=> i+start);
            
            if(isOutOfBoard(coordinates, game)) return false;
            if(coordinates.some(i=> user[i].hasAttribute("name"))) return false;

            coordinates.forEach(i=> user[i].setAttribute("name", ship_type_name));
            ships[ship_type_name].dataset.used= 1;

            updateGame(game, {
                player_ships_todo: player_ships_todo-1
            });
        }, false);
        
        document.addEventListener("fire", /** @param {fire_data} def */({ detail })=> console.dir(detail)); /* jshint devel: true *///gulp.keep.line

        button_rotate.onclick= ()=> toggleRotation(game, grid_display);
    }
    /**
     * @param {game} game
     * @param {object} new_data
     */
    function updateGame(game, new_data){
        Object.assign(game, new_data);
        if(!game.player_ships_todo){
            Object.assign(game, { state: "game" });
            game.onbeforegame.forEach(f=> f());
        }
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
     * @param {HTMLElement} grid_opponent
     */
    function registerComputer(game, grid_opponent){
        grid_opponent.classList.add("fog");
        game.types_ships.forEach(ship_type=> computersShip(ship_type, game));
        grid_opponent.setAttribute("player", "Computer");
        game.onbeforegame.push(()=> grid_opponent.onclick= fireDetection);
    }
    
    /**
     * @typedef fire_data
     * @type {object}
     * @property {object} detail
     * @property {string} detail.player Player name
     * @property {boolean} detail.loss `player`s ship uncovered
     */
    /**
     * @type {EventListener}
     * @param {Event} event
     * @this HTMLElement
     * @fires fire
     */
    function fireDetection({ target }){
        target.classList.add("uncover");
        const event= { detail: {
            player: this.getAttribute("player"),
            loss: target.hasAttribute("name")
        }, bubbles: true };
        this.dispatchEvent(new CustomEvent("fire", event));
    }
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
     * @typedef game
     * @type {object}
     * @property {"start"|"ready"|"game"|"end"} state Game state
     * @property {number} width Game width/height
     * @property {number} count_squares All squares count (width^2)
     * @property {0|1} player_ships_rotation Horizontal/verical
     * @property {number} player_ships_todo Players ships remaining to add to grid
     * @property {ship[]} types_ships
     * @property {{ user: HTMLDivElement[], opponent: HTMLDivElement[] }} boards
     * @property {HTMLDivElement[]} grid_opponent
     */
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
            player_ships_todo: 5, //ships types
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
            onbeforegame: []
        };
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
     * @typedef ship
     * @type {object}
     * @property {string} name
     * @property {number} length
     * @property {ship_coordinates[]} directions Horizontal/Vertical ship coordinates
     */
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
})();