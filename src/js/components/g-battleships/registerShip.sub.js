/* parent *//* global HTMLBattleShipsElement, _private */
gulp_place("../createElement.sub.js", "file_once");/* global createElement */
gulp_place("../../ship/createShip.sub.js", "file_once");/* global createShip */
/**
 * @param {string} name Ship name
 * @param {number} length Ship size
 */
HTMLBattleShipsElement.prototype.registerShip= function(name, length){
    const ship_el= createElement("div", { name, className: "ship", draggable: true });
    Array.from({ length }).forEach((_, id)=> ship_el.appendChild(createElement("div", { dataset: { id } })));
    this.shadowRoot.querySelector(".grid-display").appendChild(ship_el);

    /** @type {game} */
    const game= _private.get(this);
    game.types_ships.push(createShip(name, length, game.width));
};