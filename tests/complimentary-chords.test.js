import '../src/components/complimentary-chords/complimentary-chords.js';
import { getComplimentaryChords } from '../src/utils/chord-utils.js';

describe('ComplimentaryChords Web Component', () => {
  it('should define the custom element', () => {
    expect(customElements.get('complimentary-chords')).toBeDefined();
  });

  it('should return major chords for C major', () => {
    const chords = getComplimentaryChords('C', 'major-ionian');
    expect(chords).toEqual([
      { root: 'C', type: 'I' },
      { root: 'D', type: 'ii' },
      { root: 'E', type: 'iii' },
      { root: 'F', type: 'IV' },
      { root: 'G', type: 'V' },
      { root: 'A', type: 'vi' },
      { root: 'B', type: 'vii°' }
    ]);
  });

  it('should return minor chords for A minor', () => {
    const chords = getComplimentaryChords('A', 'minor-aeolian');
    expect(chords).toEqual([
      { root: 'A', type: 'i' },
      { root: 'B', type: 'ii°' },
      { root: 'C', type: 'III' },
      { root: 'D', type: 'iv' },
      { root: 'E', type: 'v' },
      { root: 'F', type: 'VI' },
      { root: 'G', type: 'VII' }
    ]);
  });

  it('should return just the key for non-major/minor modes', () => {
    const chords = getComplimentaryChords('D', 'blues');
    expect(chords).toEqual([{ root: 'D', type: '' }]);
  });
});
