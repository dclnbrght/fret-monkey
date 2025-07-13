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
          margin: 0.4rem auto;
          max-width: 22rem;
          background: #232323;
          color: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          padding: 0.4rem 0.2rem;
          text-align: center;
        }
        .chord-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.4rem;
        }
        .chord {
          background: #292929;
          border-radius: 0.3rem;
          padding: 0.3rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.07);
          border: 1px solid transparent;
          min-width: 1.8rem;
        }
        .chord-type {
          font-size: 0.7em;
          color: #aaa;
        }
        .chord.major {
          background: #2e2703 !important;
          border: 2px solid #fee500 !important;
        }
        .chord.minor {
          background: #2d1c03 !important;
          border: 1.5px solid #c6821b !important;
        }
        .chord.dim {
          background: #291b1b !important;
          border: 1.5px solid #6c392d !important;
          color: #bbb !important;
        }
        .chord-root {
          font-size: 0.9em;
          font-weight: 600;
        }
      </style>
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
        let chordClass = 'chord';
        let rootLabel = root;
        // Robust Roman numeral logic:
        // - Diminished: contains degree sign (°), ends with 'o', or contains 'dim'
        // - Minor: all lowercase roman numerals (with or without accidentals/extensions)
        // - Major: all uppercase roman numerals (with or without accidentals/extensions)
        const hasDegree = /[°o]/.test(type);
        const hasDim = /dim/i.test(type);
        const roman = type.replace(/[^ivIVb#]+/g, ''); // keep only roman numerals and accidentals
        if (hasDegree || hasDim) {
          chordClass += ' dim';
        } else if (roman && roman === roman.toLowerCase()) {
          chordClass += ' minor';
          rootLabel = root + 'm';
        } else if (roman && roman === roman.toUpperCase()) {
          chordClass += ' major';
        }
        div.className = chordClass;
        div.innerHTML = `<div class="chord-type">${type}</div><div class="chord-root">${rootLabel}</div>`;
        chordList.appendChild(div);
      });
    } else {
      chordList.innerHTML = '<span>No chords found for this key/scale.</span>';
    }
  }
}

customElements.define('complimentary-chords', ComplimentaryChords);
