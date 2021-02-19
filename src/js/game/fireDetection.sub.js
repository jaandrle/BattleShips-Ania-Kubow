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