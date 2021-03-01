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
gulp_place("./g-battleships/*.sub.js", "glob_once");
window.customElements.define("g-battleships", HTMLBattleShipsElement);