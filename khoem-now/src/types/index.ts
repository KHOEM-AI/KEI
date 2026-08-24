// ============================================================
// KEI — shared types
// ============================================================

export type KeyboardLayout = 'khmer' | 'english' | 'numbers' | 'symbols';

export type NativeSelection = { start: number; end: number };

// A single saved item. Identified by `id`, never by array index, so
// delete/edit/search/reorder never point at the wrong row.
export type StoredLine = {
  id: string;
  text: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  favorite?: boolean;
};

// Versioned storage envelope so future migrations have something to key off.
export type KeiStorageSchema = {
  version: number;
  lines: StoredLine[];
};

export type Snapshot = { text: string; anchor: number; caret: number };

export type EditorState = Snapshot & {
  past: Snapshot[];
  future: Snapshot[];
  lastEditOp: 'insert' | 'delete' | 'other' | null;
  lastEditTime: number;
};

export type EditorAction =
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
  | { type: 'LOAD_LINE'; text: string }
  | { type: 'SET_SELECTION_NATIVE'; selection: NativeSelection }
  | { type: 'SET_TEXT_FROM_NATIVE'; text: string; caret: number; now: number }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export type AppMode = 'normal' | 'editing' | 'selecting' | 'searching';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
