class NoteMarker extends HTMLElement {
  static get observedAttributes() {
    return ['highlighted', 'note', 'in-position', 'in-scale'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const highlighted = this.hasAttribute('highlighted');
    const inPosition = this.hasAttribute('in-position');
    const inScale = this.hasAttribute('in-scale');
    const note = this.getAttribute('note') || '';
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: 16px;
          height: 16px;
          vertical-align: middle;
        }
        .marker {
          width: 100%;
          height: 100%;
          border-radius: 30%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${highlighted ? '#ffeb3b' : inPosition ? '#f7b212' : inScale ? '#ffeb3b' : '#444'};
          border: 0.06rem solid #fff;
          color: ${highlighted || inScale ? '#222' : '#fff'};
          font-weight: bold;
          font-size: 0.7rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transition: background 0.2s, color 0.2s;
          opacity: ${highlighted || inPosition || inScale ? 1 : 0.8};
        }
      </style>
      <div class="marker">${note}</div>
    `;
  }
}

customElements.define('note-marker', NoteMarker);
