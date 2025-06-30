import { getScaleNotes, getFretPositions, standardTuning, getScaleNotePositions, parseScaleMode } from '../../utils/filterbar-utils.js';

class FretBoard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          width: 160px;
          min-height: 600px;
          background: #333;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          margin: 2rem auto;
        }
        .fretboard {
          position: relative;
          width: 100%;
          height: 600px;
          background: #444;
        }
        .fret {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #e0e0e0 0%, #b0b0b0 40%, #f8f8f8 60%, #b0b0b0 100%);
          box-shadow: 0 1px 3px rgba(80,80,80,0.18), 0 0.5px 0 #fff inset;
          border-radius: 1.5px;
        }
        .fret-dot-marker {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          background: #222;
          border-radius: 50%;
          box-shadow: 0 1px 6px rgba(0,0,0,0.12);
          width: 0.9em;
          height: 0.9em;
        }
        .fret-number {
          position: absolute;
          left: -28px;
          width: 24px;
          height: 20px;
          text-align: right;
          color: #ccc;
          font-size: 0.95rem;
          font-family: monospace;
          user-select: none;
        }
        .string {
          position: absolute;
          top: 0;
          height: 100%;
          background: #b7a98e;
          border-radius: 1px;
        }
        .string-1 {
          width: 0.2em; 
          background: repeating-linear-gradient(
            30deg, #e0cda9,#e0cda9 0.06em, #b7a98e 0.04em, #b7a98e 0.1em); 
        }
        .string-2 {
          width: 0.18em; 
          background: repeating-linear-gradient(
            30deg, #e0cda9,#e0cda9 0.06em, #b7a98e 0.04em, #b7a98e 0.1em); 
        }
        .string-3 {
          width: 0.16em; 
          background: repeating-linear-gradient(
            30deg, #e0cda9,#e0cda9 0.06em, #b7a98e 0.04em, #b7a98e 0.1em); 
        }
        .string-4 {
          width: 0.13em; 
        }
        .string-5 {
          width: 0.11em; 
        }
        .string-6 {
          width: 0.09em; 
        }
        .note-marker {
          position: absolute;
        }
      </style>
      <div class="fretboard">
        <div id="fret-numbers"></div>
        <div id="frets"></div>
        <div id="fret-markers"></div>
        <div id="strings"></div>
        <div id="note-markers"></div>
      </div>
    `;
    this.showNotes = true;
    this.showAllMarkers = true;
    this.currentScale = {
      key: 'A',
      scaleMode: 'major-ionian',
      position: 'open',
    };
  }

  connectedCallback() {
    this.renderFrets();
    this.renderFretMarkers();
    this.renderFretNumbers();
    this.renderStrings();
    this.renderNoteMarkers();
    window.addEventListener('toggle-all-markers', (e) => {
      this.showAllMarkers = e.detail.enabled;
      this.renderNoteMarkers();
    });
    document.querySelector('filter-bar')?.addEventListener('filter-changed', () => {
      const filterBar = document.querySelector('filter-bar')?.shadowRoot;
      if (filterBar) {
        this.showAllMarkers = filterBar.getElementById('toggle-all-markers')?.checked;
      }
      this.updateScaleFromFilterBar();
    });
  }

  updateScaleFromFilterBar() {
    const filterBar = document.querySelector('filter-bar')?.shadowRoot;
    if (!filterBar) return;
    const key = filterBar.getElementById('key')?.value || 'C';
    const scaleMode = filterBar.getElementById('scaleMode')?.value || 'major-ionian';
    const position = filterBar.getElementById('position')?.value || 'open';
    this.currentScale = { key, scaleMode, position };
    this.renderNoteMarkers();
  }

  renderNoteMarkers() {
    const container = this.shadowRoot.getElementById('note-markers');
    container.innerHTML = '';
    const { key, scaleMode, position } = this.currentScale;
    let posNum = parseInt(position);
    if (isNaN(posNum)) posNum = undefined;
    const fretCount = 22;
    const scaleLength = 600;
    const fretSpacing = scaleLength / fretCount;
    const fretPositions = [];
    for (let i = 0; i <= fretCount; i++) {
      fretPositions.push(i * fretSpacing);
    }
    const stringCount = 6;
    const min = 6;
    const max = 94;

    const showAll = scaleMode === 'all' || scaleMode === 'single-note';
    const allScaleNotes = getScaleNotes(key, scaleMode);
    const positionNotePositions = posNum ? getScaleNotePositions(key, scaleMode, posNum) : [];
    const positionLookup = new Set(positionNotePositions.map(p => `${p.string}_${p.fret}`));

    for (let s = 0; s < stringCount; s++) {
      const stringNote = standardTuning[s];
      const chromatic = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
      const openIdx = chromatic.indexOf(stringNote);
      for (let fret = 0; fret <= fretCount; fret++) {
        const noteIdx = (openIdx + fret) % 12;
        const note = chromatic[noteIdx];
        const isScaleNote = allScaleNotes.includes(note);
        const isInPosition = posNum && positionLookup.has(`${s}_${fret}`);
        const show = showAll || isScaleNote || this.showAllMarkers;
        if (!show) continue;
        let y = fret === 0 ? -18 : (fretPositions[fret] + fretPositions[fret - 1]) / 2 - 8;
        const percent = min + ((max - min) * s) / (stringCount - 1);
        const marker = document.createElement('note-marker');
        marker.setAttribute('note', note);
        if (scaleMode === 'single-note' && note === key) {
          marker.setAttribute('highlighted', '');
        } else {
          if (isScaleNote) marker.setAttribute('in-scale', '');
          if (isScaleNote && isInPosition) {
            marker.setAttribute('in-position', '');
          }
        }
        marker.style.top = `${y}px`;
        marker.style.left = `calc(${percent}% - 0.56em)`;
        marker.style.position = 'absolute';
        marker.style.pointerEvents = 'none';
        container.appendChild(marker);
      }
    }
  }

  renderFrets() {
    const container = this.shadowRoot.getElementById('frets');
    container.innerHTML = '';
    const fretCount = 22;
    const scaleLength = 600;
    // Even (linear) spacing for frets
    const fretSpacing = scaleLength / fretCount;
    for (let i = 0; i <= fretCount; i++) {
      const fret = document.createElement('div');
      fret.className = 'fret';
      fret.style.top = `${i * fretSpacing}px`;
      container.appendChild(fret);
    }
  }

  renderFretMarkers() {
    const container = this.shadowRoot.getElementById('fret-markers');
    container.innerHTML = '';
    // Standard guitar dot markers: 3, 5, 7, 9, 12 (double), 15, 17, 19, 21
    const markerFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21];
    const doubleMarker = 12;
    const fretCount = 22;
    const scaleLength = 600;
    const fretSpacing = scaleLength / fretCount;
    markerFrets.forEach(fretNum => {
      // Position marker in the middle of the fret (between fretNum-1 and fretNum)
      const y = ((fretNum - 1) + 0.5) * fretSpacing;
      if (fretNum === doubleMarker) {
        // Double marker at 12th fret
        const marker1 = document.createElement('div');
        marker1.className = 'fret-dot-marker';
        marker1.style.top = `${y - 6}px`;
        marker1.style.left = '32%';
        const marker2 = marker1.cloneNode();
        marker2.style.left = '68%';
        container.appendChild(marker1);
        container.appendChild(marker2);
      } else {
        const marker = document.createElement('div');
        marker.className = 'fret-dot-marker';
        marker.style.top = `${y - 6}px`;
        marker.style.left = '50%';
        container.appendChild(marker);
      }
    });
  }

  renderFretNumbers() {
    const container = this.shadowRoot.getElementById('fret-numbers');
    container.innerHTML = '';
    const fretCount = 22;
    const scaleLength = 600;
    const fretSpacing = scaleLength / fretCount;
    for (let i = 1; i <= fretCount; i++) {
      const num = document.createElement('div');
      num.textContent = i;
      num.className = 'fret-number';
      num.style.top = `${i * fretSpacing - 23}px`;
      container.appendChild(num);
    }
  }

  renderStrings() {
    const container = this.shadowRoot.getElementById('strings');
    container.innerHTML = '';
    const stringCount = 6;
    const min = 6;
    const max = 94;
    for (let i = 0; i < stringCount; i++) {
      const percent = min + ((max - min) * i) / (stringCount - 1);
      const string = document.createElement('div');
      string.className = 'string string-' + (i + 1) ;
      string.style.left = `calc(${percent}% - 1px)`;
      container.appendChild(string);
    }
  }
}

customElements.define('fret-board', FretBoard);
