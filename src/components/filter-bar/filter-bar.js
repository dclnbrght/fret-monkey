import { defaultSettings } from '../../settings.js';

// Helper: list of scale/mode options
const scaleModeOptions = [
  { value: 'all', label: 'All (Chromatic)' },
  { value: 'single-note', label: 'Single Note (Highlight Key)' },
  { value: 'major-ionian', label: 'Major (Ionian)' },
  { value: 'major-dorian', label: 'Dorian' },
  { value: 'major-phrygian', label: 'Phrygian' },
  { value: 'major-lydian', label: 'Lydian' },
  { value: 'major-mixolydian', label: 'Mixolydian' },
  { value: 'major-aeolian', label: 'Aeolian (Minor)' },
  { value: 'major-locrian', label: 'Locrian' },
  { value: 'minor-aeolian', label: 'Minor (Aeolian)' },
  { value: 'major-pentatonic', label: 'Major Pentatonic' },
  { value: 'minor-pentatonic', label: 'Minor Pentatonic' },
  { value: 'blues', label: 'Blues' },
];

class FilterBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          background: #292929;
          color: #fff;
          text-align: center;
          font-size: 1rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
          :host(.closed) {
          padding: 0 !important;
        }
        .toggle-btn {
          position: absolute;
          top: 1.3rem;
          right: 1rem;
          z-index: 2;
          background: #222;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 0.2rem 0.6rem 0.3rem 0.6rem;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .toggle-btn:hover {
          background: #444;
        }
        .filter-bar {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          padding: 0.5rem 1rem;
          flex-wrap: wrap;
          transition: max-height 0.3s, opacity 0.3s;
          overflow: hidden;
        }
        .filter-bar.closed {
          max-height: 0;
          opacity: 0;
          pointer-events: none;
          height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          border: none !important;
        }
        .filter-bar.open {
          max-height: 500px;
          opacity: 1;
          pointer-events: auto;
        }
        label {
          margin-right: 0.5rem;
        }
        select {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          border: 1px solid #444;
          background: #222;
          color: #fff;
        }
        @media (max-width: 600px) {
          .toggle-btn {
            right: 0.5rem;
            top: 1rem;
          }
          .filter-bar {
            flex-direction: row;
            align-items: stretch;
            gap: 0.7rem;
            padding: 0.5rem 0.5rem;
            text-align: left;
          }
        }
      </style>
      <button class="toggle-btn" id="toggleBtn" aria-label="Toggle filter bar">&#9776; Filters</button>
      <div class="filter-bar open" id="filterBar">
        <label>Scale/Mode:
          <select id="scaleMode">
            ${scaleModeOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
          </select>
        </label>
        <label>Key/Note:
          <select id="key">
            <option value="A">A</option>
            <option value="A#">A#</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="C#">C#</option>
            <option value="D">D</option>
            <option value="D#">D#</option>
            <option value="E">E</option>
            <option value="F">F</option>
            <option value="F#">F#</option>
            <option value="G">G</option>
            <option value="G#">G#</option>
          </select>
        </label>
        <label>Position:
          <select id="position">
            <option value="open">Open</option>
            <option value="1">1st</option>
            <option value="2">2nd</option>
            <option value="3">3rd</option>
            <option value="4">4th</option>
            <option value="5">5th</option>
          </select>
        </label>
        <label style="display:flex;align-items:left;gap:0.3rem;">
          <input type="checkbox" id="toggle-all-markers" checked style="accent-color:#666;" />
          Show All Notes
        </label>
      </div>
    `;
    // Load saved filter values from localStorage if present
    const saved = JSON.parse(localStorage.getItem('fretMonkeyFilters') || '{}');
    const key = saved.key || defaultSettings.key;
    const scaleMode = saved.scaleMode || 'major-ionian';
    const position = saved.position || defaultSettings.position;
    const showAllNotes = typeof saved.showAllNotes === 'boolean' ? saved.showAllNotes : defaultSettings.showAllNotes;
    // Restore open/closed state from localStorage, default to true (open)
    let open = typeof saved.open === 'boolean' ? saved.open : true;
    const filterBar = this.shadowRoot.getElementById('filterBar');
    const toggleBtn = this.shadowRoot.getElementById('toggleBtn');
    filterBar.classList.toggle('open', open);
    filterBar.classList.toggle('closed', !open);
    toggleBtn.innerHTML = open ? '&#10006; Hide' : '&#9776; Filters';

    this.shadowRoot.getElementById('key').value = key;
    this.shadowRoot.getElementById('scaleMode').value = scaleMode;
    this.shadowRoot.getElementById('position').value = position;
    this.shadowRoot.getElementById('toggle-all-markers').checked = showAllNotes;

    // Dispatch filter-changed after setting initial values so fretboard rerenders
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('filter-changed', {
        bubbles: true,
        composed: true
      }));
    }, 0);

    // Save filter values to localStorage on change
    const saveFilters = () => {
      const filters = {
        key: this.shadowRoot.getElementById('key').value,
        scaleMode: this.shadowRoot.getElementById('scaleMode').value,
        position: this.shadowRoot.getElementById('position').value,
        showAllNotes: this.shadowRoot.getElementById('toggle-all-markers').checked,
        open: open
      };
      localStorage.setItem('fretMonkeyFilters', JSON.stringify(filters));
    };

    this.shadowRoot.getElementById('toggle-all-markers').addEventListener('change', (e) => {
      saveFilters();
      window.dispatchEvent(new CustomEvent('toggle-all-markers', {
        detail: { enabled: e.target.checked },
        bubbles: true,
        composed: true
      }));
      this.dispatchEvent(new CustomEvent('filter-changed', {
        bubbles: true,
        composed: true
      }));
    });
    this.shadowRoot.querySelectorAll('select').forEach(sel => {
      sel.addEventListener('change', () => {
        saveFilters();
        this.dispatchEvent(new CustomEvent('filter-changed', {
          bubbles: true,
          composed: true
        }));
      });
    });
    // Toggle open/close logic
    toggleBtn.addEventListener('click', () => {
      open = !open;
      filterBar.classList.toggle('open', open);
      filterBar.classList.toggle('closed', !open);
      if (!open) {
        this.classList.add('closed');
      } else {
        this.classList.remove('closed');
      }
      toggleBtn.innerHTML = open ? '&#10006; Hide' : '&#9776; Filters';
      saveFilters(); // Save open state on toggle
    });
    this.shadowRoot.getElementById('scaleMode').addEventListener('change', () => {
      const scaleModeValue = this.shadowRoot.getElementById('scaleMode').value;
      const keyDropdown = this.shadowRoot.getElementById('key');
      const positionDropdown = this.shadowRoot.getElementById('position');
      const toggleAll = this.shadowRoot.getElementById('toggle-all-markers');
      if (scaleModeValue === 'all') {
        keyDropdown.disabled = true;
        positionDropdown.disabled = true;
        toggleAll.checked = true;
        toggleAll.disabled = true;
      } else if (scaleModeValue === 'single-note') {
        keyDropdown.disabled = false;
        positionDropdown.disabled = true;
        toggleAll.checked = true;
        toggleAll.disabled = true;
      } else {
        keyDropdown.disabled = false;
        positionDropdown.disabled = false;
        toggleAll.disabled = false;
      }
    });
    // On load, set disables for special modes
    if (scaleMode === 'all') {
      this.shadowRoot.getElementById('key').disabled = true;
      this.shadowRoot.getElementById('position').disabled = true;
      this.shadowRoot.getElementById('toggle-all-markers').checked = true;
      this.shadowRoot.getElementById('toggle-all-markers').disabled = true;
    } else if (scaleMode === 'single-note') {
      this.shadowRoot.getElementById('key').disabled = false;
      this.shadowRoot.getElementById('position').disabled = true;
      this.shadowRoot.getElementById('toggle-all-markers').checked = true;
      this.shadowRoot.getElementById('toggle-all-markers').disabled = true;
    }
  }
}

customElements.define('filter-bar', FilterBar);
