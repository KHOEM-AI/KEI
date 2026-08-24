// ============================================================
// KEI — undo/redo history (editor logic; see note in boundaries.ts
// about this folder location)
// ============================================================
import { EditorState, Snapshot } from '../types';

export const HISTORY_LIMIT = 50;

// Consecutive same-kind edits (typing, or repeated backspacing) within
// this window are merged into a single undo step instead of one step
// per keystroke, so Undo restores whole bursts of typing rather than
// one grapheme at a time.
export const HISTORY_MERGE_MS = 700;

export const snapshot = (s: Snapshot): Snapshot => ({ text: s.text, anchor: s.anchor, caret: s.caret });

export function withHistory(
  state: EditorState,
  next: Snapshot,
  op: 'insert' | 'delete' | 'other',
  now: number
): EditorState {
  // No-op guard: some callers (e.g. word-delete at a boundary with
  // nothing to delete) can end up computing an identical snapshot —
  // skip pushing a dead history entry in that case.
  if (next.text === state.text && next.anchor === state.anchor && next.caret === state.caret) {
    return state;
  }
  const canMerge = state.lastEditOp === op && now - state.lastEditTime < HISTORY_MERGE_MS && state.past.length > 0;
  const past = canMerge ? state.past : [...state.past.slice(-(HISTORY_LIMIT - 1)), snapshot(state)];
  return { ...state, ...next, past, future: [], lastEditOp: op, lastEditTime: now };
}
