window.customElements.define("g-battleships-ship", class extends HTMLElement{
    connectedCallback(){
        const name= this.getAttribute("name");
        const size= parseInt(this.getAttribute("size"));
        this.parentElement.registerShip(name, size);
    }
    constructor(){ super(); }
});