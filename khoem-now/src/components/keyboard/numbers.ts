// ============================================================
// KEI Data — Numbers layer (Arabic + Khmer digits)
// ============================================================
import { KHMER_NUMERALS } from './khmer';

export const ARABIC_NUMERALS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export const SUPERSCRIPT_DIGITS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
export const SUBSCRIPT_DIGITS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

export const COMMON_FRACTIONS = ['½', '⅓', '⅔', '¼', '¾', '⅛'];

export const NUMBER_KEYBOARD_LAYERS = {
  arabic: [ARABIC_NUMERALS],
  khmer: [KHMER_NUMERALS],
  extra: [SUPERSCRIPT_DIGITS, SUBSCRIPT_DIGITS, COMMON_FRACTIONS],
};

