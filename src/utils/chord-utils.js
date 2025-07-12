// Constants for chord and scale definitions
const MAJOR_CHORDS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const MINOR_CHORDS = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Accidental mappings
const SHARP_TO_FLAT = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
};

const FLAT_TO_SHARP = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#',
};

// Keys that use flats
const FLAT_KEYS_MAJOR = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
const FLAT_KEYS_MINOR = ['d', 'g', 'c', 'f', 'bb', 'eb', 'ab'];

// Chord qualities for modes (triads)
const MODE_CHORDS = {
  'major-ionian':     ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  'major-dorian':     ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'],
  'major-phrygian':   ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
  'major-lydian':     ['I', 'II', 'iii', '#iv°', 'V', 'vi', 'vii'],
  'major-mixolydian': ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
  'minor-aeolian':    ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
  'major-locrian':    ['i°', 'II', 'iii', 'iv', 'V', 'VI', 'vii'],
  'major-pentatonic': ['I', 'ii', 'iii', 'V', 'vi'],
  'minor-pentatonic': ['i', 'III', 'IV', 'V', 'VII'],
  'blues':            ['I', 'bIII', 'IV', 'bV', 'V', 'bVII'],
};

// Mode intervals (in semitones from root)
const MODE_INTERVALS = {
  'major-ionian':     [0, 2, 4, 5, 7, 9, 11],
  'major-dorian':     [0, 2, 3, 5, 7, 9, 10],
  'major-phrygian':   [0, 1, 3, 5, 7, 8, 10],
  'major-lydian':     [0, 2, 4, 6, 7, 9, 11],
  'major-mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'minor-aeolian':    [0, 2, 3, 5, 7, 8, 10],
  'major-locrian':    [0, 1, 3, 5, 6, 8, 10],
  'major-pentatonic': [0, 2, 4, 7, 9],
  'minor-pentatonic': [0, 3, 5, 7, 10],
  'blues':            [0, 3, 5, 6, 7, 10],
};

function isFlatKey(key, scaleMode) {
  // Accept both upper and lower case for minor keys
  if (scaleMode && scaleMode.startsWith('minor')) {
    return FLAT_KEYS_MINOR.includes(key.toLowerCase());
  }
  return FLAT_KEYS_MAJOR.includes(key);
}

function getChordRoot(key, interval, scaleMode) {
  const idx = CHROMATIC.indexOf(key);
  const note = CHROMATIC[(idx + interval) % 12];
  // Use flats for flat keys, sharps for sharp keys
  if (isFlatKey(key, scaleMode)) {
    return SHARP_TO_FLAT[note] || note;
  } else {
    return note;
  }
}

function getComplimentaryChords(key, scaleMode) {
  let chords = [];
  let roots = [];
  
  // Use mode/scale-specific logic if available
  if (MODE_CHORDS[scaleMode] && MODE_INTERVALS[scaleMode]) {
    roots = MODE_INTERVALS[scaleMode].map(i => getChordRoot(key, i, scaleMode));
    chords = roots.map((root, i) => ({ root, type: MODE_CHORDS[scaleMode][i] || '' }));
  } else if (scaleMode.startsWith('major')) {
    // fallback for major
    roots = [0, 2, 4, 5, 7, 9, 11].map(i => getChordRoot(key, i, scaleMode));
    chords = roots.map((root, i) => ({ root, type: MAJOR_CHORDS[i] }));
  } else if (scaleMode.startsWith('minor')) {
    // fallback for minor
    roots = [0, 2, 3, 5, 7, 8, 10].map(i => getChordRoot(key, i, scaleMode));
    chords = roots.map((root, i) => ({ root, type: MINOR_CHORDS[i] }));
  } else {
    // For other/unknown modes/scales, just return the key as a single chord
    chords = [{ root: key, type: '' }];
  }
  return chords;
}

export {
  getComplimentaryChords,
  isFlatKey,
  getChordRoot,
  MODE_CHORDS,
  MODE_INTERVALS,
  SHARP_TO_FLAT,
  FLAT_TO_SHARP,
  CHROMATIC
};
