// ============================================================
// KEI Utils — Unicode grapheme segmentation
// ============================================================
// Handles Khmer coeng/combining-mark clusters and emoji (ZWJ sequences,
// skin-tone modifiers, flags) as single units so cursor movement and
// deletion never split a visual character in half.

const segmenter: any =
  typeof Intl !== 'undefined' && (Intl as any).Segmenter
    ? new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' })
    : null;

export const KHMER_COMBINING = /[\u17B4\u17B5\u17B7-\u17C5\u17C7\u17C8\u17C9-\u17D1\u17D3\u200C\u200D]/;
export const KHMER_COENG = '\u17D2';
export const KHMER_SCRIPT = /[\u1780-\u17FF]/;

function isLowSurrogate(c: number) { return c >= 0xdc00 && c <= 0xdfff; }
function isHighSurrogate(c: number) { return c >= 0xd800 && c <= 0xdbff; }

function heuristicPreviousBoundary(text: string, pos: number): number {
  if (pos <= 0) return 0;
  let i = pos - 1;
  const cc = text.charCodeAt(i);
  if (isLowSurrogate(cc) && i - 1 >= 0 && isHighSurrogate(text.charCodeAt(i - 1))) i -= 1;
  while (i > 0) {
    if (KHMER_COMBINING.test(text[i])) { i--; continue; }
    if (text[i - 1] === KHMER_COENG) { i -= 2; continue; }
    break;
  }
  return Math.max(0, i);
}

function heuristicNextBoundary(text: string, pos: number): number {
  if (pos >= text.length) return text.length;
  let i = pos + 1;
  const cc = text.charCodeAt(pos);
  if (isHighSurrogate(cc) && pos + 1 < text.length && isLowSurrogate(text.charCodeAt(pos + 1))) i = pos + 2;
  while (i < text.length) {
    if (text[i] === KHMER_COENG && i + 1 < text.length) { i += 2; continue; }
    if (KHMER_COMBINING.test(text[i])) { i++; continue; }
    break;
  }
  return Math.min(text.length, i);
}

export function previousGraphemeBoundary(text: string, pos: number): number {
  if (pos <= 0) return 0;
  if (segmenter) {
    let last = 0;
    for (const seg of segmenter.segment(text)) {
      if (seg.index >= pos) break;
      last = seg.index;
    }
    return last;
  }
  return heuristicPreviousBoundary(text, pos);
}

export function nextGraphemeBoundary(text: string, pos: number): number {
  if (pos >= text.length) return text.length;
  if (segmenter) {
    for (const seg of segmenter.segment(text)) {
      if (seg.index >= pos) return seg.index + seg.segment.length;
    }
    return text.length;
  }
  return heuristicNextBoundary(text, pos);
}

// Snap any position (e.g. one reported by a native touch handle) to the
// nearest valid grapheme boundary so we never split a combined cluster.
export function normalizeBoundary(text: string, pos: number): number {
  if (pos <= 0) return 0;
  if (pos >= text.length) return text.length;
  if (segmenter) {
    let lastBoundary = 0;
    for (const seg of segmenter.segment(text)) {
      if (seg.index === pos) return pos;
      if (seg.index > pos) return lastBoundary;
      lastBoundary = seg.index;
    }
    return lastBoundary;
  }
  const prevB = heuristicPreviousBoundary(text, pos + 1);
  return prevB <= pos ? prevB : pos;
}

export function graphemesOfLine(text: string): string[] {
  if (segmenter) return Array.from(segmenter.segment(text), (s: any) => s.segment);
  const result: string[] = [];
  let i = 0;
  while (i < text.length) {
    const next = heuristicNextBoundary(text, i);
    result.push(text.slice(i, Math.max(next, i + 1)));
    i = Math.max(next, i + 1);
  }
  return result;
}

export function graphemeCount(text: string): number {
  return graphemesOfLine(text).length;
}

// When native changes text directly (e.g. system context-menu paste),
// infer the new caret from a prefix/suffix diff instead of clamping the
// old caret, which misplaces the cursor whenever the change overlapped a
// selection.
export function inferCursorFromDiff(oldText: string, newText: string): number {
  const minLen = Math.min(oldText.length, newText.length);
  let start = 0;
  while (start < minLen && oldText[start] === newText[start]) start++;
  let oldEnd = oldText.length;
  let newEnd = newText.length;
  while (oldEnd > start && newEnd > start && oldText[oldEnd - 1] === newText[newEnd - 1]) {
    oldEnd--; newEnd--;
  }
  return newEnd;
}

// Unicode-normalize before comparing so visually identical Khmer
// sequences built from different combining-mark orders still match.
export function normalizeForSearch(s: string): string {
  return s.normalize('NFC').toLowerCase();
}
