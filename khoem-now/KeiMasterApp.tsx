import React, { useReducer, useEffect, useRef, useCallback, useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useWindowDimensions,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// Types
// ============================================================
type KeyboardLayout = 'khmer' | 'english' | 'symbols';
type NativeSelection = { start: number; end: number };
type StoredLine = { id: string; text: string };

// ============================================================
// Unicode grapheme segmentation
// ============================================================
const segmenter: any =
  typeof Intl !== 'undefined' && (Intl as any).Segmenter
    ? new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' })
    : null;

const KHMER_COMBINING = /[\u17B4\u17B5\u17B7-\u17C5\u17C7\u17C8\u17C9-\u17D1\u17D3\u200C\u200D]/;
const KHMER_COENG = '\u17D2';
const KHMER_SCRIPT = /[\u1780-\u17FF]/;

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
function previousGraphemeBoundary(text: string, pos: number): number {
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
function nextGraphemeBoundary(text: string, pos: number): number {
  if (pos >= text.length) return text.length;
  if (segmenter) {
    for (const seg of segmenter.segment(text)) {
      if (seg.index >= pos) return seg.index + seg.segment.length;
    }
    return text.length;
  }
  return heuristicNextBoundary(text, pos);
}

// Snap any position (e.g. one reported by native touch handles) to the
// nearest valid grapheme boundary so we never split a combined cluster.
function normalizeBoundary(text: string, pos: number): number {
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

function graphemesOfLine(text: string): string[] {
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

// ============================================================
// Word boundary
// Khmer script has no spaces between words. True word segmentation needs
// a dictionary/algorithm outside the scope of this heuristic. To avoid the
// old bug where Word-left/right skipped an entire unspaced Khmer clause,
// we degrade to one grapheme cluster per press once we hit Khmer script
// (not a real "word", but it no longer overshoots).
// ============================================================
const WORD_CHAR = /[\p{L}\p{N}_]/u;
const SPACE_CHAR = /\s/;

function previousWordBoundary(text: string, pos: number): number {
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
function nextWordBoundary(text: string, pos: number): number {
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
function moveVertical(text: string, caret: number, direction: 1 | -1): number {
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

// When native changes text directly (rare — e.g. system context-menu paste
// while our soft keyboard is showing), infer the new caret from a
// prefix/suffix diff instead of clamping the old caret, which used to
// misplace the cursor whenever the change overlapped a selection.
function inferCursorFromDiff(oldText: string, newText: string): number {
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

// ============================================================
// Editor state — single source of truth for text/selection.
// Native TextInput is always driven FROM this state; native events are
// only accepted back in when they don't match what we last pushed out
// (see lastSyncedTextRef / lastSyncedSelectionRef below), instead of a
// fragile "suppress next N events" counter that could desync on
// out-of-order native events.
// ============================================================
type Snapshot = { text: string; anchor: number; caret: number };
type EditorState = Snapshot & {
  past: Snapshot[];
  future: Snapshot[];
  lastEditOp: 'insert' | 'delete' | 'other' | null;
  lastEditTime: number;
};

type EditorAction =
  | { type: 'INSERT'; text: string; now: number }
  | { type: 'DELETE_BACKWARD'; now: number }
  | { type: 'DELETE_FORWARD'; now: number }
  | { type: 'DELETE_WORD_BACKWARD'; now: number }
  | { type: 'DELETE_WORD_FORWARD'; now: number }
  | { type: 'MOVE_LEFT'; extend: boolean }
  | { type: 'MOVE_RIGHT'; extend: boolean }
  | { type: 'MOVE_WORD_LEFT'; extend: boolean }
  | { type: 'MOVE_WORD_RIGHT'; extend: boolean }
  | { type: 'MOVE_VERTICAL'; direction: 1 | -1; extend: boolean }
  | { type: 'HOME'; extend: boolean }
  | { type: 'END'; extend: boolean }
  | { type: 'DOC_HOME'; extend: boolean }
  | { type: 'DOC_END'; extend: boolean }
  | { type: 'SELECT_ALL' }
  | { type: 'CLEAR'; now: number }
  // Loading a saved line or cancelling an edit is a system state change,
  // not a user edit — it must never land on the user's undo stack.
  | { type: 'LOAD_LINE'; text: string }
  | { type: 'SET_SELECTION_NATIVE'; selection: NativeSelection }
  | { type: 'SET_TEXT_FROM_NATIVE'; text: string; caret: number; now: number }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const HISTORY_LIMIT = 50;
// Consecutive same-kind edits (typing, or repeated backspacing) within
// this window are merged into a single undo step instead of one step per
// keystroke, so Undo restores whole bursts of typing rather than one
// grapheme at a time.
const HISTORY_MERGE_MS = 700;

const rangeOf = (s: Snapshot) => ({ start: Math.min(s.anchor, s.caret), end: Math.max(s.anchor, s.caret) });
const snapshot = (s: Snapshot): Snapshot => ({ text: s.text, anchor: s.anchor, caret: s.caret });

function withHistory(
  state: EditorState,
  next: Snapshot,
  op: 'insert' | 'delete' | 'other',
  now: number
): EditorState {
  const canMerge = state.lastEditOp === op && now - state.lastEditTime < HISTORY_MERGE_MS && state.past.length > 0;
  const past = canMerge ? state.past : [...state.past.slice(-(HISTORY_LIMIT - 1)), snapshot(state)];
  return { ...state, ...next, past, future: [], lastEditOp: op, lastEditTime: now };
}

function collapseOrMove(state: EditorState, newCaret: number, extend: boolean) {
  return extend ? { anchor: state.anchor, caret: newCaret } : { anchor: newCaret, caret: newCaret };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
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
        future: [snapshot(state), ...state.future].slice(0, HISTORY_LIMIT),
        lastEditOp: null,
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        ...state, text: next.text, anchor: next.anchor, caret: next.caret,
        past: [...state.past, snapshot(state)].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
        lastEditOp: null,
      };
    }
    default:
      return state;
  }
}

// ============================================================
// Storage — migrates the old string[] shape to {id,text}[] so existing
// users don't lose data, and debounces writes instead of writing on
// every keystroke-driven line change.
// ============================================================
const STORAGE_KEY = '@kei_storage_lines';
const SAVE_DEBOUNCE_MS = 500;

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function migrateStoredLines(raw: unknown): StoredLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === 'string') return { id: makeId(), text: item };
    if (item && typeof item === 'object' && 'text' in item) {
      return { id: String((item as any).id ?? makeId()), text: String((item as any).text ?? '') };
    }
    return { id: makeId(), text: '' };
  });
}

export default function KeiMasterApp() {
  const [lines, setLines] = useState<StoredLine[]>([]);
  const [linesLoaded, setLinesLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>('khmer');
  const [shiftOn, setShiftOn] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [selMode, setSelMode] = useState(false);
  const [showAdvancedBar, setShowAdvancedBar] = useState(false);
  const [showSigilBoard, setShowSigilBoard] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { width: windowWidth } = useWindowDimensions();

  const [editor, dispatch] = useReducer(editorReducer, {
    text: '', anchor: 0, caret: 0, past: [], future: [], lastEditOp: null, lastEditTime: 0,
  });

  const inputRef = useRef<TextInput>(null);
  const searchInputRef = useRef<TextInput>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { start: selStart, end: selEnd } = rangeOf(editor);

  // "Last known synced value" replaces suppressNext* counters: an incoming
  // native event that matches what we last pushed to the TextInput is a
  // genuine echo and is dropped; anything else is a real native change.
  // Worst case under a race is a duplicate (idempotent) dispatch, never a
  // dropped character or a stuck cursor.
  const lastSyncedTextRef = useRef(editor.text);
  const lastSyncedSelectionRef = useRef<NativeSelection>({ start: selStart, end: selEnd });
  useEffect(() => {
    lastSyncedTextRef.current = editor.text;
    lastSyncedSelectionRef.current = { start: selStart, end: selEnd };
  });

  const ensureEditorFocus = useCallback(() => {
    if (!editorFocused) inputRef.current?.focus();
  }, [editorFocused]);

  const dispatchWithFocus = useCallback((action: EditorAction) => {
    ensureEditorFocus();
    dispatch(action);
  }, [ensureEditorFocus]);

  // ---- load ----
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setLines(migrateStoredLines(JSON.parse(saved)));
      } catch (e) {
        console.warn('KEI Storage load failed', e);
      } finally {
        setLinesLoaded(true);
      }
    })();
  }, []);

  // ---- debounced save ----
  useEffect(() => {
    if (!linesLoaded) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lines)).catch((e) =>
        console.warn('KEI Storage save failed', e)
      );
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [lines, linesLoaded]);
  // flush any pending save on unmount
  useEffect(() => () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lines)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddLine = () => {
    if (editor.text.trim() === '') return;
    if (editingId !== null) {
      setLines((prev) => prev.map((line) => (line.id === editingId ? { ...line, text: editor.text } : line)));
      setEditingId(null);
    } else {
      setLines((prev) => [...prev, { id: makeId(), text: editor.text }]);
    }
    dispatch({ type: 'CLEAR', now: Date.now() });
  };

  const handleLoadLine = (line: StoredLine) => {
    dispatchWithFocus({ type: 'LOAD_LINE', text: line.text });
    setEditingId(line.id);
  };

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    dispatch({ type: 'LOAD_LINE', text: '' });
  }, []);

  // "Clear" and "cancel edit" used to be two different meanings hiding
  // behind one CLR key: pressing CLR while editing wiped the text box but
  // silently left editingId set, so the next Add saved over the wrong
  // line. CLR now always ends any active edit too.
  const handleClearKey = useCallback(() => {
    if (editingId !== null) {
      handleCancelEdit();
    } else {
      dispatch({ type: 'CLEAR', now: Date.now() });
    }
  }, [editingId, handleCancelEdit]);

  const handleDeleteLine = (line: StoredLine) => {
    Alert.alert('លុបបន្ទាត់', 'តើអ្នកចង់លុបបន្ទាត់នេះមែនទេ?', [
      { text: 'បោះបង់', style: 'cancel' },
      {
        text: 'លុប',
        style: 'destructive',
        onPress: () => {
          setLines((prev) => prev.filter((l) => l.id !== line.id));
          if (editingId === line.id) handleCancelEdit();
        },
      },
    ]);
  };

  const onNativeChangeText = (t: string) => {
    if (t === lastSyncedTextRef.current) return; // echo of our own controlled value
    const inferredCaret = inferCursorFromDiff(lastSyncedTextRef.current, t);
    dispatch({ type: 'SET_TEXT_FROM_NATIVE', text: t, caret: inferredCaret, now: Date.now() });
  };
  const onNativeSelectionChange = (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    const { start, end } = e.nativeEvent.selection;
    const synced = lastSyncedSelectionRef.current;
    if (start === synced.start && end === synced.end) return; // echo
    dispatch({ type: 'SET_SELECTION_NATIVE', selection: { start, end } });
  };

  const handleKeyPress = useCallback((char: string) => {
    let out = char;
    if (keyboardLayout === 'english' && (capsLockOn || shiftOn)) out = char.toUpperCase();
    dispatchWithFocus({ type: 'INSERT', text: out, now: Date.now() });
    if (shiftOn && !capsLockOn) setShiftOn(false);
  }, [keyboardLayout, capsLockOn, shiftOn, dispatchWithFocus]);

  const handleCopy = async () => {
    const { start, end } = rangeOf(editor);
    if (start === end) return;
    try { await Clipboard.setStringAsync(editor.text.slice(start, end)); } catch (e) { console.warn('Copy failed', e); }
  };
  const handleCut = async () => {
    const { start, end } = rangeOf(editor);
    if (start === end) return;
    try {
      await Clipboard.setStringAsync(editor.text.slice(start, end));
      dispatchWithFocus({ type: 'DELETE_BACKWARD', now: Date.now() });
    } catch (e) { console.warn('Cut failed', e); }
  };
  const handlePaste = async () => {
    try {
      const clip = await Clipboard.getStringAsync();
      if (clip) dispatchWithFocus({ type: 'INSERT', text: clip, now: Date.now() });
    } catch (e) { console.warn('Paste failed', e); }
  };

  const commandRow1 = ['ESC', 'CTRL', 'ALT'];
  const sigilCategories = [
    { id: '1', title: 'CYBERNETIC SIGILS', icon: '❇️' },
    { id: '2', title: 'THE GREAT ARCHITECT', icon: '✡️' },
    { id: '3', title: 'EMBLEM OF ALMIGHTY', icon: '⚜️' },
    { id: '4', title: 'SPIRIT OF UNITY', icon: '🪬' },
    { id: '5', title: 'DIVINE WILL BE DONE', icon: '☸️' },
  ];
  const khmerRows = [
    ['ឈ', 'ឆ', 'ឃ', 'ឍ', 'ថ', 'ប', 'ផ', 'ឡ', 'ឪ', 'ឳ'],
    ['ព្យ', 'ភ', 'ឋ', 'ខ', 'ល', 'ក', 'ច', 'វ', 'ន'],
    ['ម', 'ជ', 'ហ', 'គ', 'ង', 'ព', 'អ', 'ឥ'],
    ['ា', 'ិ', 'ី', 'ឹ', 'ឺ', 'ុ', 'ូ', 'ួ', 'ើ', 'ឿ'],
  ];
  const englishRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '?'],
  ];
  const symbolRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
    ['-', '_', '=', '+', '[', ']', '{', '}', '|', '\\'],
    [':', ';', '<', '>', '"', "'", '`', '~'],
  ];
  const currentRows = keyboardLayout === 'khmer' ? khmerRows : keyboardLayout === 'english' ? englishRows : symbolRows;

  // Responsive key width: derived from the actual screen width and the
  // longest row, instead of a fixed 34dp that was cramped on small
  // screens and wasted space on large ones.
  const keyWidth = useMemo(() => {
    const maxRowLen = Math.max(...currentRows.map((r) => r.length), 1);
    const horizontalPadding = 16; // matches keyRowWrap padding + margins
    const raw = (windowWidth - horizontalPadding) / maxRowLen - 4; // minus per-key margin
    return Math.max(30, Math.min(44, Math.floor(raw)));
  }, [currentRows, windowWidth]);

  // Normalize NFC before comparing so visually-identical Khmer sequences
  // built from different combining-mark orders still match in search.
  const norm = (s: string) => s.normalize('NFC').toLowerCase();
  const filteredLines = useMemo(
    () => lines.filter((line) => norm(line.text).includes(norm(searchQuery))),
    [lines, searchQuery]
  );

  const hasSelection = selStart !== selEnd;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flexFill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.searchContainer}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="🔍 ស្វែងរកកូដ ឬអត្ថបទ..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="ស្វែងរក"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.searchClearBtn}
              onPress={() => setSearchQuery('')}
              accessibilityRole="button"
              accessibilityLabel="សម្អាតការស្វែងរក"
            >
              <Text style={styles.searchClearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.displayArea}>
          <View style={styles.headerRow}>
            <Text style={styles.headerIndicator}>📊 KEI Storage | Total Lines: {lines.length}</Text>
            {hasSelection && (
              <Text style={styles.selIndicator}>
                ✂️ {graphemesOfLine(editor.text.slice(selStart, selEnd)).length} selected
              </Text>
            )}
          </View>
          {filteredLines.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {lines.length === 0 ? 'មិនទាន់មានទិន្នន័យទេ — សូមវាយបញ្ចូលខាងក្រោម' : 'រកមិនឃើញលទ្ធផលត្រូវនឹងការស្វែងរក'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredLines}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <View style={[styles.lineRow, editingId === item.id && styles.lineRowEditing]}>
                  <TouchableOpacity
                    style={styles.lineTapArea}
                    onPress={() => handleLoadLine(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`កែសម្រួលបន្ទាត់ទី ${index + 1}`}
                  >
                    <Text style={styles.lineNum}>{index + 1}:</Text>
                    <Text style={styles.lineText}>{item.text}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.lineDeleteBtn}
                    onPress={() => handleDeleteLine(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`លុបបន្ទាត់ទី ${index + 1}`}
                  >
                    <Text style={styles.lineDeleteText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              )}
              style={styles.listView}
            />
          )}
        </View>

        <View style={styles.toggleMenuContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.toggleBtn, showAdvancedBar && styles.activeBtn]}
              onPress={() => { setShowAdvancedBar((v) => !v); setShowSigilBoard(false); }}
              accessibilityRole="button"
            >
              <Text style={styles.toggleBtnText}>{showAdvancedBar ? '− បិទរបារកូដ' : '+ 📢KEI🤖😎'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, styles.sigilBtn, showSigilBoard && styles.activeBtn]}
              onPress={() => { setShowSigilBoard((v) => !v); setShowAdvancedBar(false); }}
              accessibilityRole="button"
            >
              <Text style={styles.toggleBtnText}>👁️ Sigils 🔮</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {showAdvancedBar && (
          <View style={styles.advancedToolbar}>
            <View style={styles.cmdRowWrap}>
              {commandRow1.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.cmdButton}
                  onPress={() => dispatchWithFocus({ type: 'INSERT', text: `[${item}]`, now: Date.now() })}
                  accessibilityRole="button"
                >
                  <Text style={styles.cmdText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.toolbarNote}>ESC / CTRL / ALT — command layer ពិតប្រាកដ គ្រោងទុកសម្រាប់ជំហានបន្ទាប់</Text>
          </View>
        )}

        {showSigilBoard && (
          <View style={styles.sigilBoard}>
            <Text style={styles.sigilHeader}>#KHOEM-SOKSIVUTHA - AI-369-400-401</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sigilScroll}>
              {sigilCategories.map((sigil) => (
                <TouchableOpacity
                  key={sigil.id}
                  style={styles.sigilCard}
                  onPress={() => dispatchWithFocus({ type: 'INSERT', text: `[${sigil.title}]`, now: Date.now() })}
                  accessibilityRole="button"
                  accessibilityLabel={sigil.title}
                >
                  <Text style={styles.sigilIcon}>{sigil.icon}</Text>
                  <Text style={styles.sigilTitle}>{sigil.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.keyboardContainer}>
          <View style={styles.langBar}>
            {(['khmer', 'english', 'symbols'] as KeyboardLayout[]).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.langBtn, keyboardLayout === lang && styles.activeLang]}
                onPress={() => setKeyboardLayout(lang)}
                accessibilityRole="button"
              >
                <Text style={styles.langText}>{lang === 'khmer' ? '🇰🇭 ខ្មែរ' : lang === 'english' ? '🇺🇸 EN' : '🔢 123'}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.langBtn, styles.selBtn, selMode && styles.activeSel]}
              onPress={() => setSelMode((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel="របៀបជ្រើសរើសអត្ថបទ"
            >
              <Text style={styles.langText}>🔀 SEL</Text>
            </TouchableOpacity>
          </View>

          {currentRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keyRowWrap}>
              {row.map((char, charIndex) => (
                <TouchableOpacity
                  key={`${rowIndex}-${charIndex}-${char}`}
                  style={[styles.keyFixed, { width: keyWidth }]}
                  onPress={() => handleKeyPress(char)}
                  accessibilityRole="button"
                  accessibilityLabel={char}
                >
                  <Text style={styles.keyText}>{keyboardLayout === 'english' && (shiftOn || capsLockOn) ? char.toUpperCase() : char}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.keyRow}>
            <TouchableOpacity style={[styles.key, styles.modKey, shiftOn && styles.activeLang]} onPress={() => setShiftOn((v) => !v)} accessibilityRole="button" accessibilityLabel="Shift">
              <Text style={styles.keyTextSmall}>⇧ Shift</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey, capsLockOn && styles.activeLang]} onPress={() => setCapsLockOn((v) => !v)} accessibilityRole="button" accessibilityLabel="Caps lock">
              <Text style={styles.keyTextSmall}>⇪ Caps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'INSERT', text: '  ', now: Date.now() })} accessibilityRole="button" accessibilityLabel="Tab">
              <Text style={styles.keyTextSmall}>↹ Tab</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'HOME', extend: selMode })} accessibilityRole="button" accessibilityLabel="Home">
              <Text style={styles.keyTextSmall}>↤ Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'END', extend: selMode })} accessibilityRole="button" accessibilityLabel="End">
              <Text style={styles.keyTextSmall}>↦ End</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.keyRow}>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'DOC_HOME', extend: selMode })} accessibilityRole="button" accessibilityLabel="ដើមឯកសារ">
              <Text style={styles.keyTextSmall}>⇞ Doc Start</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'MOVE_WORD_LEFT', extend: selMode })} accessibilityRole="button" accessibilityLabel="ពាក្យខាងឆ្វេង">
              <Text style={styles.keyTextSmall}>⇤ Word</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'MOVE_WORD_RIGHT', extend: selMode })} accessibilityRole="button" accessibilityLabel="ពាក្យខាងស្តាំ">
              <Text style={styles.keyTextSmall}>Word ⇥</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'DOC_END', extend: selMode })} accessibilityRole="button" accessibilityLabel="ចុងឯកសារ">
              <Text style={styles.keyTextSmall}>Doc End ⇟</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.keyRow}>
            <TouchableOpacity style={styles.key} onPress={() => dispatchWithFocus({ type: 'MOVE_LEFT', extend: selMode })} accessibilityRole="button" accessibilityLabel="ឆ្វេង">
              <Text style={styles.keyText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.key} onPress={() => dispatchWithFocus({ type: 'MOVE_VERTICAL', direction: -1, extend: selMode })} accessibilityRole="button" accessibilityLabel="ឡើងលើ">
              <Text style={styles.keyText}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.key} onPress={() => dispatchWithFocus({ type: 'MOVE_VERTICAL', direction: 1, extend: selMode })} accessibilityRole="button" accessibilityLabel="ចុះក្រោម">
              <Text style={styles.keyText}>↓</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.key} onPress={() => dispatchWithFocus({ type: 'MOVE_RIGHT', extend: selMode })} accessibilityRole="button" accessibilityLabel="ស្តាំ">
              <Text style={styles.keyText}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'DELETE_FORWARD', now: Date.now() })} accessibilityRole="button" accessibilityLabel="លុបខាងមុខ">
              <Text style={styles.keyText}>⌦</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'DELETE_BACKWARD', now: Date.now() })} accessibilityRole="button" accessibilityLabel="លុបខាងក្រោយ">
              <Text style={styles.keyText}>⌫</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.keyRow}>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'DELETE_WORD_BACKWARD', now: Date.now() })} accessibilityRole="button" accessibilityLabel="លុបពាក្យខាងក្រោយ">
              <Text style={styles.keyTextSmall}>⌫ Word</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'DELETE_WORD_FORWARD', now: Date.now() })} accessibilityRole="button" accessibilityLabel="លុបពាក្យខាងមុខ">
              <Text style={styles.keyTextSmall}>Word ⌦</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.key, styles.modKey]}
              onPress={() => dispatchWithFocus({ type: 'UNDO' })}
              disabled={editor.past.length === 0}
              accessibilityRole="button"
              accessibilityLabel="Undo"
              accessibilityState={{ disabled: editor.past.length === 0 }}
            >
              <Text style={[styles.keyTextSmall, editor.past.length === 0 && styles.disabledText]}>↶ Undo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.key, styles.modKey]}
              onPress={() => dispatchWithFocus({ type: 'REDO' })}
              disabled={editor.future.length === 0}
              accessibilityRole="button"
              accessibilityLabel="Redo"
              accessibilityState={{ disabled: editor.future.length === 0 }}
            >
              <Text style={[styles.keyTextSmall, editor.future.length === 0 && styles.disabledText]}>↷ Redo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.keyRow}>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={handleCopy} accessibilityRole="button" accessibilityLabel="ចម្លង">
              <Text style={styles.keyTextSmall}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={handleCut} accessibilityRole="button" accessibilityLabel="កាត់">
              <Text style={styles.keyTextSmall}>Cut</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={handlePaste} accessibilityRole="button" accessibilityLabel="បិទភ្ជាប់">
              <Text style={styles.keyTextSmall}>Paste</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'SELECT_ALL' })} accessibilityRole="button" accessibilityLabel="ជ្រើសរើសទាំងអស់">
              <Text style={styles.keyTextSmall}>SELECT ALL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={handleClearKey} accessibilityRole="button" accessibilityLabel="សម្អាត">
              <Text style={styles.keyTextSmall}>CLR</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.keyRow}>
            <TouchableOpacity style={[styles.key, styles.spaceKey]} onPress={() => handleKeyPress(' ')} accessibilityRole="button" accessibilityLabel="Space">
              <Text style={styles.keyText}>Space</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.enterKey]} onPress={() => dispatchWithFocus({ type: 'INSERT', text: '\n', now: Date.now() })} accessibilityRole="button" accessibilityLabel="បន្ទាត់ថ្មី">
              <Text style={styles.keyText}>↵ Enter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {editingId !== null && (
          <View style={styles.editingBanner}>
            <Text style={styles.editingBannerText}>✏️ កំពុងកែសម្រួលបន្ទាត់</Text>
            <TouchableOpacity onPress={handleCancelEdit} accessibilityRole="button" accessibilityLabel="បោះបង់ការកែសម្រួល">
              <Text style={styles.editingBannerCancel}>បោះបង់</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="វាយបញ្ចូលកូដ ឬអត្ថបទថ្មីនៅទីនេះ..."
            placeholderTextColor="#888"
            value={editor.text}
            onChangeText={onNativeChangeText}
            onSelectionChange={onNativeSelectionChange}
            selection={{ start: selStart, end: selEnd }}
            onFocus={() => setEditorFocused(true)}
            onBlur={() => setEditorFocused(false)}
            showSoftInputOnFocus={false}
            scrollEnabled
            multiline
            accessibilityLabel="ប្រអប់វាយអត្ថបទ"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddLine}
            accessibilityRole="button"
            accessibilityLabel={editingId !== null ? 'រក្សាទុកការកែសម្រួល' : 'បញ្ចូលបន្ទាត់ថ្មី'}
          >
            <Text style={styles.addText}>{editingId !== null ? 'រក្សាទុក ✓' : 'បញ្ចូល (+)'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  flexFill: { flex: 1 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 10 },
  searchInput: { flex: 1, backgroundColor: '#1e293b', color: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, fontSize: 13, borderWidth: 1, borderColor: '#334155' },
  searchClearBtn: { marginLeft: -34, padding: 8 },
  searchClearText: { color: '#94a3b8', fontSize: 13, fontWeight: 'bold' },
  displayArea: { flex: 1, padding: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerIndicator: { color: '#38bdf8', fontSize: 11, fontWeight: 'bold' },
  selIndicator: { color: '#facc15', fontSize: 11, fontWeight: 'bold' },
  listView: { flex: 1, backgroundColor: '#1e293b', borderRadius: 8, padding: 10 },
  emptyState: { flex: 1, backgroundColor: '#1e293b', borderRadius: 8, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyStateText: { color: '#64748b', fontSize: 12, textAlign: 'center' },
  lineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  lineRowEditing: { backgroundColor: '#0c1e33', borderRadius: 6 },
  lineTapArea: { flex: 1, flexDirection: 'row' },
  lineNum: { color: '#64748b', fontSize: 12, width: 35, fontWeight: 'bold' },
  lineText: { color: '#f8fafc', fontSize: 14, flex: 1 },
  lineDeleteBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  lineDeleteText: { fontSize: 13 },
  toggleMenuContainer: { paddingHorizontal: 15, paddingBottom: 8, flexDirection: 'row' },
  toggleBtn: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginRight: 8 },
  sigilBtn: { backgroundColor: '#4c1d95' },
  activeBtn: { borderWidth: 1, borderColor: '#38bdf8' },
  toggleBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  advancedToolbar: { backgroundColor: '#020617', paddingVertical: 8, paddingHorizontal: 10, borderTopWidth: 1, borderColor: '#334155' },
  cmdRowWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  cmdButton: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#1e293b', borderRadius: 6, marginRight: 8, marginBottom: 6 },
  cmdText: { color: '#38bdf8', fontSize: 13, fontWeight: 'bold' },
  toolbarNote: { color: '#64748b', fontSize: 9, marginTop: 2 },
  sigilBoard: { backgroundColor: '#090d16', paddingVertical: 10, borderTopWidth: 1, borderColor: '#4c1d95' },
  sigilHeader: { color: '#94a3b8', fontSize: 9, textAlign: 'center', marginBottom: 8, letterSpacing: 1 },
  sigilScroll: { paddingHorizontal: 10 },
  sigilCard: { backgroundColor: '#1e293b', borderRadius: 8, padding: 10, alignItems: 'center', marginRight: 10, width: 110, borderWidth: 1, borderColor: '#334155' },
  sigilIcon: { fontSize: 26, marginBottom: 4 },
  sigilTitle: { color: '#38bdf8', fontSize: 8, textAlign: 'center', fontWeight: 'bold' },
  keyboardContainer: { backgroundColor: '#1e293b', paddingBottom: 10, paddingTop: 5, borderTopWidth: 1, borderColor: '#334155' },
  langBar: { flexDirection: 'row', justifyContent: 'center', marginBottom: 6, alignItems: 'center' },
  langBtn: { paddingHorizontal: 15, paddingVertical: 4, backgroundColor: '#334155', borderRadius: 5, marginHorizontal: 5 },
  selBtn: { backgroundColor: '#7c2d12' },
  activeSel: { backgroundColor: '#ea580c', borderWidth: 1, borderColor: '#fed7aa' },
  activeLang: { backgroundColor: '#0284c7' },
  langText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  keyRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 4, paddingHorizontal: 2 },
  keyRowWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 4, paddingHorizontal: 2 },
  key: { flex: 1, minWidth: 40, backgroundColor: '#334155', height: 42, justifyContent: 'center', alignItems: 'center', margin: 2, borderRadius: 5 },
  keyFixed: { height: 42, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', margin: 2, borderRadius: 5 },
  modKey: { backgroundColor: '#475569' },
  enterKey: { flex: 1, backgroundColor: '#0284c7' },
  spaceKey: { flex: 4 },
  keyText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  keyTextSmall: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  disabledText: { color: '#64748b' },
  editingBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0c1e33', paddingHorizontal: 15, paddingVertical: 6, borderTopWidth: 1, borderColor: '#334155' },
  editingBannerText: { color: '#38bdf8', fontSize: 11, fontWeight: 'bold' },
  editingBannerCancel: { color: '#f87171', fontSize: 11, fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#0f172a', borderTopWidth: 1, borderColor: '#334155' },
  textInput: { flex: 1, backgroundColor: '#1e293b', color: '#FFF', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, fontSize: 14, maxHeight: 100 },
  addButton: { backgroundColor: '#0284c7', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18, borderRadius: 8, marginLeft: 8 },
  addText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
});
