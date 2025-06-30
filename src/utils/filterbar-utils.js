// Utility functions for filter bar logic

// Shared chromatic scale array
export const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Shared baseRanges for scale positions
export const BASE_RANGES = {
  'major': [
    {min: -1, max: 3},  // Position 1 (E shape)
    {min: 2, max: 5},   // Position 2 (D shape)
    {min: 4, max: 7},   // Position 3 (C shape)
    {min: 6, max: 9},   // Position 4 (A shape)
    {min: 8, max: 11},  // Position 5 (G shape)
  ],
  'minor': [
    {min: 0, max: 3},   // Position 1 (Am shape)
    {min: 2, max: 5},   // Position 2
    {min: 4, max: 7},   // Position 3
    {min: 6, max: 9},   // Position 4
    {min: 8, max: 11},  // Position 5
  ],
  'major-pentatonic': [
    {min: -1, max: 3},  // Position 1
    {min: 1, max: 5},   // Position 2
    {min: 4, max: 7},   // Position 3
    {min: 6, max: 9},   // Position 4
    {min: 9, max: 12},  // Position 5
  ],
  'minor-pentatonic': [
    {min: 0, max: 3},   // Position 1
    {min: 2, max: 5},   // Position 2
    {min: 4, max: 8},   // Position 3
    {min: 6, max: 10},  // Position 4
    {min: 9, max: 12},  // Position 5
  ],
  'blues': [
    {min: 0, max: 3},   // Position 1
    {min: 2, max: 5},   // Position 2
    {min: 4, max: 7},   // Position 3
    {min: 6, max: 10},  // Position 4
    {min: 9, max: 12},  // Position 5
  ],
};

// Helper: parse scale/mode from combined value
export function parseScaleMode(scaleModeValue) {
  if (!scaleModeValue) return { scale: 'major', mode: 'ionian' };
  if (scaleModeValue === 'blues') return { scale: 'blues', mode: 'ionian' };
  if (scaleModeValue === 'major-pentatonic') return { scale: 'major-pentatonic', mode: 'ionian' };
  if (scaleModeValue === 'minor-pentatonic') return { scale: 'minor-pentatonic', mode: 'aeolian' };
  // e.g. 'major-dorian', 'minor-aeolian'
  const [scale, mode] = scaleModeValue.split('-');
  return { scale, mode };
}

/**
 * Get the notes for a given scale, key, mode, and position (fingering shape).
 * @param {string} key - The root note (e.g. 'C', 'D#').
 * @param {string} scaleMode - The combined scale/mode value (e.g. 'major-dorian', 'major-pentatonic').
 * @param {number} [position] - The scale fingering position (1-based, e.g. 1 = position 1). Optional; if omitted, returns all scale notes.
 * @returns {string[]} Array of note names in the scale and position.
 */
export function getScaleNotes(key, scaleMode, position) {
  if (scaleMode === 'all') {
    // Chromatic scale, all notes
    return CHROMATIC;
  }
  if (scaleMode === 'single-note') {
    // Only the selected key note
    return [key];
  }
  const { scale, mode } = parseScaleMode(scaleMode);
  // Scale intervals (in semitones)
  const intervals = {
    major:      [2,2,1,2,2,2,1],
    minor:      [2,1,2,2,1,2,2],
    'major-pentatonic': [2,2,3,2,3],
    'minor-pentatonic': [3,2,2,3,2],
    blues:      [3,2,1,1,3,2],
  };
  // Modes as rotations of major scale
  const modeOffsets = {
    ionian: 0, dorian: 1, phrygian: 2, lydian: 3, mixolydian: 4, aeolian: 5, locrian: 6
  };
  let pattern = intervals[scale] || intervals.major;
  // Handle modes for major scale
  if (modeOffsets[mode] !== undefined && scale === 'major') {
    pattern = [...pattern.slice(modeOffsets[mode]), ...pattern.slice(0, modeOffsets[mode])];
  }
  // Handle modes for minor scale
  if (modeOffsets[mode] !== undefined && scale === 'minor') {
    // Aeolian is natural minor, others are not standard for minor
    if (mode === 'aeolian') {
      pattern = intervals.minor;
    }
  }
  let notes = [];
  let idx = CHROMATIC.indexOf(key);
  notes.push(CHROMATIC[idx]);
  for (let i = 0; i < pattern.length; i++) {
    idx = (idx + pattern[i]) % CHROMATIC.length;
    notes.push(CHROMATIC[idx]);
  }
  // Remove octave repeat
  notes.pop();

  // If no position is specified, return all scale notes
  if (!position) return notes;

  // Use shared BASE_RANGES
  const base = BASE_RANGES[scale] || BASE_RANGES['major'];
  const rootFret = getRootFret(key);
  // Offset all positions by rootFret
  const positionFretRanges = base.map(r => ({ min: r.min + rootFret, max: r.max + rootFret }));

  // Only filter if we have a defined position range for this scale
  let filteredNotes = notes;
  if (positionFretRanges && position >= 1 && position <= positionFretRanges.length) {
    const {min, max} = positionFretRanges[position-1];
    // For each string, check which notes appear in the fret range
    const tuning = standardTuning; // ['E', 'A', 'D', 'G', 'B', 'E']
    const notesInPosition = new Set();
    for (let stringIdx = 0; stringIdx < tuning.length; stringIdx++) {
      const openNote = tuning[stringIdx];
      for (let fret = min; fret <= max; fret++) {
        const noteIdx = (CHROMATIC.indexOf(openNote) + fret) % 12;
        const note = CHROMATIC[noteIdx];
        if (notes.includes(note)) {
          notesInPosition.add(note);
        }
      }
    }
    filteredNotes = notes.filter(n => notesInPosition.has(n));
  }
  return filteredNotes;
}

/**
 * Get the fret positions for a given string and note.
 * @param {string} openNote - The open string note (e.g. 'E').
 * @param {string} targetNote - The note to find on the string.
 * @returns {number[]} Array of fret numbers where the note appears.
 */
export function getFretPositions(openNote, targetNote) {
  const openIdx = CHROMATIC.indexOf(openNote);
  const targetIdx = CHROMATIC.indexOf(targetNote);
  let positions = [];
  for (let fret = 0; fret <= 22; fret++) {
    if ((openIdx + fret) % 12 === targetIdx) {
      positions.push(fret);
    }
  }
  return positions;
}

/**
 * Standard tuning for 6-string guitar (low to high)
 */
export const standardTuning = ['E', 'A', 'D', 'G', 'B', 'E'];

/**
 * Get the note positions for a given scale, key, mode, and position (fingering shape).
 * Returns an array of { string, fret, note } for the selected position.
 * @param {string} key
 * @param {string} scaleMode
 * @param {number} [position]
 * @returns {Array<{string: number, fret: number, note: string}>}
 */
export function getScaleNotePositions(key, scaleMode, position) {
  const { scale, mode } = parseScaleMode(scaleMode);
  const scaleNotes = getScaleNotes(key, scaleMode);
  const tuning = standardTuning;
  const fretCount = 22;
  // Use shared BASE_RANGES
  let fretRange = { min: 0, max: fretCount };
  if (position && BASE_RANGES[scale] && position >= 1 && position <= BASE_RANGES[scale].length) {
    const rootFret = getRootFret(key);
    const rel = BASE_RANGES[scale][position-1];
    fretRange = { min: rel.min + rootFret, max: rel.max + rootFret };
  }
  const positions = [];
  for (let stringIdx = 0; stringIdx < tuning.length; stringIdx++) {
    const openNote = tuning[stringIdx];
    for (let fret = fretRange.min; fret <= fretRange.max; fret++) {
      const noteIdx = (CHROMATIC.indexOf(openNote) + fret) % 12;
      const note = CHROMATIC[noteIdx];
      if (scaleNotes.includes(note)) {
        positions.push({ string: stringIdx, fret, note });
      }
    }
  }
  return positions;
}

// Helper: get root fret for a key on the low E string (string 0)
function getRootFret(key) {
  const openIdx = CHROMATIC.indexOf('E');
  const keyIdx = CHROMATIC.indexOf(key);
  let fret = (keyIdx - openIdx + 12) % 12;
  return fret;
}
