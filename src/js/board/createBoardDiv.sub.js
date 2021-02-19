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