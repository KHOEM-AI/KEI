// ============================================================
// KEI Data — Khmer character groups
// ============================================================
// Splitting these out (audit item 3) so the keyboard layout can be
// assembled/reordered per-layer without touching component code, and so
// a future dictionary-based word-segmenter has one place to pull the
// script's character classes from.

export const KHMER_CONSONANTS = [
  'ក', 'ខ', 'គ', 'ឃ', 'ង',
  'ច', 'ឆ', 'ជ', 'ឈ', 'ញ',
  'ដ', 'ឋ', 'ឌ', 'ឍ', 'ណ',
  'ត', 'ថ', 'ទ', 'ធ', 'ន',
  'ប', 'ផ', 'ព', 'ភ', 'ម',
  'យ', 'រ', 'ល', 'វ',
  'ស', 'ហ', 'ឡ', 'អ',
];

export const KHMER_INDEPENDENT_VOWELS = [
  'ឥ', 'ឦ', 'ឧ', 'ឨ', 'ឩ', 'ឪ', 'ឫ', 'ឬ', 'ឭ', 'ឮ', 'ឯ', 'ឰ', 'ឱ', 'ឳ',
];

// Dependent vowel signs — combine with a preceding consonant.
export const KHMER_DEPENDENT_VOWELS = [
  'ា', 'ិ', 'ី', 'ឹ', 'ឺ', 'ុ', 'ូ', 'ួ', 'ើ', 'ឿ', 'ៀ', 'េ', 'ែ', 'ៃ', 'ោ', 'ៅ', 'ុំ', 'ំ', 'ាំ',
];

// Coeng (subscript) marker — combine with KHMER_COENG + consonant to
// build a subscript consonant cluster, e.g. ស + ្ + រ → ស្រ.
export const KHMER_COENG = '\u17D2';

export const KHMER_DIACRITICS_AND_SIGNS = [
  '៉', // musikatoan
  '៊', // triisap
  '់', // bantoc
  '័', // samyok sannya
  '៍', // toandakhiat
  '៎', // kakabat
  '៏', // ahsda
  'ៈ', // yuukaleapintu
  '៌', // repeater/robat
  '៑', // vaeqvean
  '‌', // (zero width non-joiner marker slot — rendered via keyboard label)
];

export const KHMER_NUMERALS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

export const KHMER_PUNCTUATION = ['។', '៕', '៖', 'ៗ', '៘', '៙', '៚', '៝', '«', '»'];

export const KHMER_CURRENCY = '៛';

// Keyboard "layers" — what the Khmer key layout renders per shift state.
// Not a full layout yet (see audit item 2/30); this groups what already
// existed plus the missing numerals/punctuation/currency so the UI can
// start rendering them as dedicated rows instead of leaving them out.
export const KHMER_KEYBOARD_LAYERS = {
  base: [
    KHMER_CONSONANTS.slice(0, 11),
    KHMER_CONSONANTS.slice(11, 22),
    KHMER_CONSONANTS.slice(22, 33),
    KHMER_DEPENDENT_VOWELS.slice(0, 10),
  ],
  shift: [
    KHMER_INDEPENDENT_VOWELS,
    KHMER_DEPENDENT_VOWELS.slice(10),
    KHMER_DIACRITICS_AND_SIGNS.slice(0, 9),
  ],
  numerals: [KHMER_NUMERALS],
  punctuation: [[...KHMER_PUNCTUATION, KHMER_CURRENCY]],
};
