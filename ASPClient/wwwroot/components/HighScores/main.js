class HighScores extends HTMLElement {
    constructor() {
        super();
        this.count = 0;
        // Attach a shadow root to the element.
        let shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `<h3>[[count]]</h3>`;
    }
    Add() {
        this.count++;
    }
}
window.customElements.define('high-scores', HighScores);
//# sourceMappingURL=main.js.map