/**
 * @param {string} tag_name Like `link`, `style`, `div`, …
 * @param {object|null} def 
 * @returns {HTMLElement} An elemenet based on `tyg_name`
 */
function createElement(tag_name, def){
    const el= document.createElement(tag_name);
    Object.keys(def).forEach(n=> {
        switch (n){
            case "name": el.setAttribute(n, def[n]); break;
            case "dataset": Object.assign(el.dataset, def.dataset); break;
            default : el[n]= def[n];
        }
    });
    return el;
}