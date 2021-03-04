gulp_place("../dispatchGameEvent.sub.js", "file_once");/* global dispatchGameEvent */
/**
 * @type {EventListener}
 * @param {Event} event
 * @this HTMLElement
 * @fires game
 * @listens fire
 */
function fireDetection({ target }){
    target.classList.add("uncover");
    dispatchGameEvent(this, {
        type: "fire",
        loss: target.hasAttribute("name") ? target.getAttribute("name") : false,
        square: parseInt(target.dataset.id)
    });
}