gulp_place("./GameEventData.type.sub.js", "file_once");
/**
 * @typedef GameEvent
 * @type {object}
 * @property {HTMLDivElement} target
 * @property {string} type
 * @property {GameEventData} detail
 */
/**
 * @param {HTMLElement} target
 * @param {GameEventData} detail `detail` key for `CustomEvent`
 */
function dispatchGameEvent(target, detail){
    return target.dispatchEvent(new CustomEvent("game", { detail, bubbles: true }));
}