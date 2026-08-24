// ============================================================
// KEI — word boundaries & vertical movement
// ============================================================
// NOTE ON LOCATION: this file lives in src/storage/ only because that is
// where it was placed in the project's current folder layout — it is
// editor logic, not storage logic. Nothing here reads/writes disk. If
// you later create a dedicated src/editor/ folder, this file (and
// history.ts) belong there instead.
//
// Khmer script has no spaces between words. True word segmentation needs
// a dictionary/algorithm outside the scope of this heuristic. To avoid
// "Word ←/→" skipping an entire unspaced Khmer clause, we degrade to one
// grapheme cluster per press once we hit Khmer script — not a real
// "word", but it no longer overshoots.

import { KHMER_SCRIPT, graphemesOfLine, nextGraphemeBoundary, previousGraphemeBoundary } from '../utils/unicode';

const WORD_CHAR = /[\p{L}\p{N}_]/u;
const SPACE_CHAR = /\s/;

export function previousWordBoundary(text: string, pos: number): number {
  let i = pos;
  while (i > 0 && SPACE_CHAR.test(text[i - 1])) i--;
  if (i > 0 && KHMER_SCRIPT.test(text[i - 1])) return previousGraphemeBoundary(text, i);
  if (i > 0 && WORD_CHAR.test(text[i - 1])) {
    while (i > 0 && WORD_CHAR.test(text[i - 1]) && !KHMER_SCRIPT.test(text[i - 1])) i--;
  } else {
    while (i > 0 && !SPACE_CHAR.test(text[i - 1]) && !WORD_CHAR.test(text[i - 1])) i--;
  }
  return i;
}

export function nextWordBoundary(text: string, pos: number): number {
  let i = pos;
  const len = text.length;
  while (i < len && SPACE_CHAR.test(text[i])) i++;
  if (i < len && KHMER_SCRIPT.test(text[i])) return nextGraphemeBoundary(text, i);
  if (i < len && WORD_CHAR.test(text[i])) {
    while (i < len && WORD_CHAR.test(text[i]) && !KHMER_SCRIPT.test(text[i])) i++;
  } else {
    while (i < len && !SPACE_CHAR.test(text[i]) && !WORD_CHAR.test(text[i])) i++;
  }
  return i;
}

// Vertical movement measured in grapheme columns (not UTF-16 units) so
// combining marks / emoji ZWJ sequences don't throw off ↑/↓.
// Note: this is *logical*-line based (split on \n). A multiline
// TextInput can visually wrap a long logical line across several screen
// rows; true "visual line" up/down would need layout measurement from
// the native view — tracked as a follow-up.
export function moveVertical(text: string, caret: number, direction: 1 | -1): number {
  const curLineStart = caret === 0 ? 0 : (text.lastIndexOf('\n', caret - 1) + 1);
  let curLineEnd = text.indexOf('\n', caret);
  if (curLineEnd === -1) curLineEnd = text.length;

  const curLineGraphemes = graphemesOfLine(text.slice(curLineStart, curLineEnd));
  let acc = curLineStart;
  let col = 0;
  for (const g of curLineGraphemes) {
    if (acc >= caret) break;
    acc += g.length;
    col++;
  }

  let targetLineStart: number;
  let targetLineEnd: number;
  if (direction === -1) {
    if (curLineStart === 0) return caret;
    const prevLineEnd = curLineStart - 1;
    targetLineStart = text.lastIndexOf('\n', prevLineEnd - 1) + 1;
    targetLineEnd = prevLineEnd;
  } else {
    if (curLineEnd === text.length) return caret;
    targetLineStart = curLineEnd + 1;
    const nextNL = text.indexOf('\n', targetLineStart);
    targetLineEnd = nextNL === -1 ? text.length : nextNL;
  }

  const targetGraphemes = graphemesOfLine(text.slice(targetLineStart, targetLineEnd));
  let pos = targetLineStart;
  const steps = Math.min(col, targetGraphemes.length);
  for (let i = 0; i < steps; i++) pos += targetGraphemes[i].length;
  return pos;
}
