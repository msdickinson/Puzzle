class HighScores extends HTMLElement {

    public count: number = 0; 

    constructor() {
        super();
        // Attach a shadow root to the element.
        let shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `<h3>[[count]]</h3>`;
    }

    public Add() {
        this.count++;
    }

  
}

window.customElements.define('high-scores', HighScores);
