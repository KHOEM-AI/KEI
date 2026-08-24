// ============================================================
// KEI Editor Engine — reducer
// ============================================================
// This is the ONE source of truth for text/selection. Keyboard buttons
// and native TextInput events both flow through here — nothing else is
// allowed to mutate text/anchor/caret directly.
//
//   Keyboard button ─┐
//   Native TextInput ─┼─▶ dispatch(action) ─▶ editorReducer ─▶ EditorState ─▶ TextInput (controlled)
//
import { EditorAction, EditorState, Snapshot } from '../../types';
import { normalizeBoundary, previousGraphemeBoundary, nextGraphemeBoundary } from '../../utils/unicode';
import { previousWordBoundary, nextWordBoundary, moveVertical, withHistory } from '../../storage';

export const rangeOf = (s: Snapshot) => ({ start: Math.min(s.anchor, s.caret), end: Math.max(s.anchor, s.caret) });

export const initialEditorState: EditorState = {
  text: '', anchor: 0, caret: 0, past: [], future: [], lastEditOp: null, lastEditTime: 0,
};

function collapseOrMove(state: EditorState, newCaret: number, extend: boolean) {
  return extend ? { anchor: state.anchor, caret: newCaret } : { anchor: newCaret, caret: newCaret };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'INSERT': {
      const { start, end } = rangeOf(state);
      const text = state.text.slice(0, start) + action.text + state.text.slice(end);
      const pos = start + action.text.length;
      const op = end > start ? 'other' : 'insert'; // typing over a selection starts a fresh undo step
      return withHistory(state, { text, anchor: pos, caret: pos }, op, action.now);
    }
    case 'DELETE_BACKWARD': {
      const { start, end } = rangeOf(state);
      if (start !== end) {
        const text = state.text.slice(0, start) + state.text.slice(end);
        return withHistory(state, { text, anchor: start, caret: start }, 'other', action.now);
      }
      if (start === 0) return state;
      const b = previousGraphemeBoundary(state.text, start);
      const text = state.text.slice(0, b) + state.text.slice(start);
      return withHistory(state, { text, anchor: b, caret: b }, 'delete', action.now);
    }
    case 'DELETE_FORWARD': {
      const { start, end } = rangeOf(state);
      if (start !== end) {
        const text = state.text.slice(0, start) + state.text.slice(end);
        return withHistory(state, { text, anchor: start, caret: start }, 'other', action.now);
      }
      if (start >= state.text.length) return state;
      const b = nextGraphemeBoundary(state.text, start);
      const text = state.text.slice(0, start) + state.text.slice(b);
      return withHistory(state, { text, anchor: start, caret: start }, 'delete', action.now);
    }
    case 'DELETE_WORD_BACKWARD': {
      const { start, end } = rangeOf(state);
      if (start !== end) {
        const text = state.text.slice(0, start) + state.text.slice(end);
        return withHistory(state, { text, anchor: start, caret: start }, 'other', action.now);
      }
      const b = previousWordBoundary(state.text, start);
      if (b === start) return state; // nothing to delete — avoid a dead history entry
      const text = state.text.slice(0, b) + state.text.slice(start);
      return withHistory(state, { text, anchor: b, caret: b }, 'other', action.now);
    }
    case 'DELETE_WORD_FORWARD': {
      const { start, end } = rangeOf(state);
      if (start !== end) {
        const text = state.text.slice(0, start) + state.text.slice(end);
        return withHistory(state, { text, anchor: start, caret: start }, 'other', action.now);
      }
      const b = nextWordBoundary(state.text, start);
      if (b === start) return state; // nothing to delete
      const text = state.text.slice(0, start) + state.text.slice(b);
      return withHistory(state, { text, anchor: start, caret: start }, 'other', action.now);
    }
    case 'MOVE_LEFT': {
      const { start, end } = rangeOf(state);
      const newCaret = !action.extend && state.anchor !== state.caret
        ? start
        : previousGraphemeBoundary(state.text, state.caret);
      return { ...state, ...collapseOrMove(state, newCaret, action.extend) };
    }
    case 'MOVE_RIGHT': {
      const { start, end } = rangeOf(state);
      const newCaret = !action.extend && state.anchor !== state.caret
        ? end
        : nextGraphemeBoundary(state.text, state.caret);
      return { ...state, ...collapseOrMove(state, newCaret, action.extend) };
    }
    case 'MOVE_WORD_LEFT': {
      const newCaret = previousWordBoundary(state.text, state.caret);
      return { ...state, ...collapseOrMove(state, newCaret, action.extend) };
    }
    case 'MOVE_WORD_RIGHT': {
      const newCaret = nextWordBoundary(state.text, state.caret);
      return { ...state, ...collapseOrMove(state, newCaret, action.extend) };
    }
    case 'MOVE_VERTICAL': {
      const newPos = moveVertical(state.text, state.caret, action.direction);
      if (newPos === state.caret) return state;
      return { ...state, ...collapseOrMove(state, newPos, action.extend) };
    }
    case 'HOME': {
      const before = state.text.slice(0, state.caret);
      const pos = before.lastIndexOf('\n') + 1;
      return { ...state, ...collapseOrMove(state, pos, action.extend) };
    }
    case 'END': {
      const nextNewline = state.text.indexOf('\n', state.caret);
      const pos = nextNewline === -1 ? state.text.length : nextNewline;
      return { ...state, ...collapseOrMove(state, pos, action.extend) };
    }
    case 'DOC_HOME':
      return { ...state, ...collapseOrMove(state, 0, action.extend) };
    case 'DOC_END':
      return { ...state, ...collapseOrMove(state, state.text.length, action.extend) };
    case 'SELECT_ALL':
      return { ...state, anchor: 0, caret: state.text.length };
    case 'CLEAR':
      return withHistory(state, { text: '', anchor: 0, caret: 0 }, 'other', action.now);
    case 'LOAD_LINE': {
      const len = action.text.length;
      return { ...state, text: action.text, anchor: len, caret: len, lastEditOp: null };
    }
    case 'SET_SELECTION_NATIVE': {
      const start = normalizeBoundary(state.text, Math.max(0, Math.min(state.text.length, action.selection.start)));
      const end = normalizeBoundary(state.text, Math.max(0, Math.min(state.text.length, action.selection.end)));
      return { ...state, anchor: start, caret: end };
    }
    case 'SET_TEXT_FROM_NATIVE': {
      const pos = normalizeBoundary(action.text, Math.max(0, Math.min(action.text.length, action.caret)));
      return withHistory(state, { text: action.text, anchor: pos, caret: pos }, 'other', action.now);
    }
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const prev = state.past[state.past.length - 1];
      return {
        ...state, text: prev.text, anchor: prev.anchor, caret: prev.caret,
        past: state.past.slice(0, -1),
        future: [{ text: state.text, anchor: state.anchor, caret: state.caret }, ...state.future],
        lastEditOp: null,
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        ...state, text: next.text, anchor: next.anchor, caret: next.caret,
        past: [...state.past, { text: state.text, anchor: state.anchor, caret: state.caret }],
        future: state.future.slice(1),
        lastEditOp: null,
      };
    }
    default:
      return state;
  }
}
