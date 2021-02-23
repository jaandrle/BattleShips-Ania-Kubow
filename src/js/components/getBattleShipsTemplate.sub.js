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