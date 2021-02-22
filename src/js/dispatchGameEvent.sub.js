/**
 * @param {HTMLElement} target
 * @param {object} detail `detail` key for `CustomEvent`
 * @param {"start"|"ready"|"fire"|"end"} detail.type
 * @param {boolean} [detail.loss] For `fire` type
 */
function dispatchGameEvent(target, detail){
    return target.dispatchEvent(new CustomEvent("game", { detail, bubbles: true }));
}