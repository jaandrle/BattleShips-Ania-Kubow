window.customElements.define("g-battleships-styles", class extends HTMLElement{
    connectedCallback(){
        if(!this.hasAttribute("href")) return this.parentElement.registerStyles({ innerHTML: this.innerHTML });
        else return this.parentElement.registerStyles({ href: this.getAttribute("href") });
    }
    constructor(){ super(); }
});