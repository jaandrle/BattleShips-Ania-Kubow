/* jshint esversion: 6,-W097, -W040, browser: true, expr: true, undef: true */
(function BattleShipsModule(){
    const { floor, abs, random }= Math;
    const randomIntegerTill= max=> floor(random()*max);

    if(document.readyState==="complete") return main();
    return document.addEventListener("DOMContentLoaded", main);
    function main(){
        const [ grid_user, grid_computer, grid_display ]= [ "user", "computer", "display" ].map(name=> document.getElementsByClassName("grid-"+name)[0]);
        const ships= document.getElementsByName("ship");
        const [ button_start, button_rotate ]= [ "start", "rotate" ].map(id=> document.getElementById(id));
        const [ display_turn, display_info ]= [ "whose-go", "info" ].map(id=> document.getElementById(id));
        
        const game= createGameConfig({
            width: 10,
            grid_user, grid_opponent: grid_computer
        });
        document.body.setAttribute("style", `--count-squares: ${game.width};`);//sync with CSS
        
        game.types_ships.forEach(ship_type=> computersShip(ship_type, game));
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
        
        const is_taken= current.some(i=> board[i].hasAttribute("name"));
        if(is_taken||isOutOfBoard(current, game))
            return computersShip(ship, game);

        const name= ship.name;
        current.forEach(i=> board[i].setAttribute("name", name));
    }
    /**
     * @param {ship_coordinates} coordinates
     * @param {number} start
     * @param {game} game
     */
    function isOutOfBoard(coordinates, { width }){
        return coordinates.some(i=> {
            const curr= i%width;
            return curr === width-1 || curr === 0;
        });
    }
    /**
     * @typedef game
     * @type {object}
     * @property {number} width Game width/height
     * @property {number} count_squares All squares count (width^2)
     * @property {ship[]} types_ships
     * @property {{ user: HTMLDivElement[], opponent: HTMLDivElement[] }} boards
     */
    /**
     * @param {number} width Squares number per width/height of boards
     * @returns {game}
     */
    function createGameConfig({ width, grid_user, grid_opponent }){
        const count_squares= width*width;
        return {
            width, count_squares,
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
            }
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