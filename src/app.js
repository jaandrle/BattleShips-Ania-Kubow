(function BattleShipsModule(){
    gulp_place("./js/main.sub.js", "file_once");/* global main */
    if(document.readyState==="complete") return main();
    return document.addEventListener("DOMContentLoaded", main);
})();