// ============================================================
// KEI Data — Symbol library, grouped by category (audit item 6)
// ============================================================

export const SYMBOLS_BASIC = [
  '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
  '-', '_', '=', '+', '[', ']', '{', '}', '|', '\\',
  ':', ';', '<', '>', '"', "'", '`', '~', '/', '?',
];

export const SYMBOLS_PROGRAMMING = [
  '<', '>', '/', '\\', '|', '&', '&&', '||', '!',
  '==', '===', '!=', '!==', '=>', '->', '::', '??', '...',
];

export const SYMBOLS_MATH = [
  '+', '−', '×', '÷', '=', '≠', '<', '>', '≤', '≥', '≈', '∞', '√', '∑', 'π', '∫', '%',
];

export const SYMBOLS_CURRENCY = ['$', '€', '£', '¥', '₹', '₩', '฿', '៛', '¢'];

export const SYMBOLS_TYPOGRAPHY = ['…', '—', '–', '•', '·', '©', '®', '™', '°', '§', '¶'];

export const SYMBOLS_ARROWS = ['←', '↑', '↓', '→', '↔', '↕', '⇐', '⇒', '⇑', '⇓'];

export const SYMBOL_KEYBOARD_LAYERS = {
  basic: SYMBOLS_BASIC,
  programming: SYMBOLS_PROGRAMMING,
  math: SYMBOLS_MATH,
  currency: SYMBOLS_CURRENCY,
  typography: SYMBOLS_TYPOGRAPHY,
  arrows: SYMBOLS_ARROWS,
};
