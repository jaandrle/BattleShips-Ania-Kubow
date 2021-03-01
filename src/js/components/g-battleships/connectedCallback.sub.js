/* parent *//* global HTMLBattleShipsElement, _private */
gulp_place("../getBattleShipsTemplate.sub.js", "file_once");/* global getBattleShipsTemplate */
gulp_place("../../game/createGameConfig.sub.js", "file_once");/* global createGameConfig */
gulp_place("../../game/toggleRotation.sub.js", "file_once");/* global toggleRotation */
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
    
    this.addEventListener("game", this);
};