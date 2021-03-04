/* parent *//* global HTMLBattleShipsElement */
gulp_place("../createElement.sub.js", "file_once");/* global createElement */
HTMLBattleShipsElement.prototype.registerStyles= function({ href, innerHTML }){
    return this.shadowRoot.appendChild(
        href ?
        createElement("link", { rel: "stylesheet", href }) :
        createElement("style", { innerHTML })
    );
};