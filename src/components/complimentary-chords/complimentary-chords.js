// Complimentary Chords Web Component
import { getComplimentaryChords } from '../../utils/chord-utils.js';

class ComplimentaryChords extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 2rem auto 2rem auto;
          max-width: 22rem;
          background: #232323;
          color: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          padding: 0.2rem 0.3rem;
          text-align: center;
        }
        h2 {
          font-size: 1.2rem;
          margin: 0.5rem auto;
          letter-spacing: 0.03em;
          color: #ccc;
        }
        .chord-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
        }
        .chord {
          background: #292929;
          border-radius: 0.3rem;
          padding: 0.5rem 0.7rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.07);
        }
        .chord-type {
          font-size: 0.8em;
          color: #aaa;
        }
        .chord-root {
          font-size: 1em;
          font-weight: 600;
        }
      </style>
      <h2>Chords</h2>
      <div class="chord-list" id="chordList"></div>
    `;
  }

  connectedCallback() {
    window.addEventListener('filter-changed', this.updateChords);
    this.updateChords();
  }

  disconnectedCallback() {
    window.removeEventListener('filter-changed', this.updateChords);
  }

  updateChords = () => {
    // Get current filter values from localStorage
    const filters = JSON.parse(localStorage.getItem('fretMonkeyFilters') || '{}');
    const key = filters.key || 'C';
    const scaleMode = filters.scaleMode || 'major-ionian';
    // Get complimentary chords for the current key/scale
    const chords = getComplimentaryChords(key, scaleMode);
    const chordList = this.shadowRoot.getElementById('chordList');
    chordList.innerHTML = '';
    if (chords && chords.length) {
      chords.forEach(({ root, type }) => {
        const div = document.createElement('div');
        div.className = 'chord';
        div.innerHTML = `<div class="chord-type">${type}</div><div class="chord-root">${root}</div>`;
        chordList.appendChild(div);
      });
    } else {
      chordList.innerHTML = '<span>No chords found for this key/scale.</span>';
    }
  }
}

customElements.define('complimentary-chords', ComplimentaryChords);
