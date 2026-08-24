// ============================================================
// KEI Storage Service
// ============================================================
// Wraps AsyncStorage behind a versioned schema so future format changes
// have somewhere to hook a migration, and debounces writes instead of
// hitting disk on every keystroke-driven line change.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeiStorageSchema, StoredLine } from '../types';

const STORAGE_KEY = '@kei_storage_v1';
const LEGACY_STORAGE_KEY = '@kei_storage_lines'; // pre-schema key, string[] or {id,text}[]
export const SCHEMA_VERSION = 1;
export const SAVE_DEBOUNCE_MS = 500;

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function coerceLine(item: unknown): StoredLine {
  const now = Date.now();
  if (typeof item === 'string') {
    return { id: makeId(), text: item, createdAt: now, updatedAt: now };
  }
  if (item && typeof item === 'object') {
    const obj = item as Partial<StoredLine>;
    return {
      id: obj.id ? String(obj.id) : makeId(),
      text: obj.text ? String(obj.text) : '',
      createdAt: typeof obj.createdAt === 'number' ? obj.createdAt : now,
      updatedAt: typeof obj.updatedAt === 'number' ? obj.updatedAt : now,
      tags: obj.tags,
      favorite: obj.favorite,
    };
  }
  return { id: makeId(), text: '', createdAt: now, updatedAt: now };
}

/**
 * Loads stored lines, transparently migrating:
 *  - legacy plain string[] under the old key
 *  - legacy {id,text}[] under the old key
 *  - future schema versions (add a case per version bump)
 */
export async function loadLines(): Promise<StoredLine[]> {
  try {
    const current = await AsyncStorage.getItem(STORAGE_KEY);
    if (current) {
      const parsed: KeiStorageSchema = JSON.parse(current);
      if (parsed && Array.isArray(parsed.lines)) {
        return parsed.lines.map(coerceLine);
      }
    }
    const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const raw = JSON.parse(legacy);
      if (Array.isArray(raw)) return raw.map(coerceLine);
    }
    return [];
  } catch (e) {
    console.warn('KEI Storage load failed', e);
    return [];
  }
}

export async function saveLines(lines: StoredLine[]): Promise<boolean> {
  try {
    const payload: KeiStorageSchema = { version: SCHEMA_VERSION, lines };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.warn('KEI Storage save failed', e);
    return false;
  }
}

export async function clearAllData(): Promise<boolean> {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEY, LEGACY_STORAGE_KEY]);
    return true;
  } catch (e) {
    console.warn('KEI Storage clear failed', e);
    return false;
  }
}

/** JSON export string suitable for sharing/writing to a file. */
export function exportLinesAsJson(lines: StoredLine[]): string {
  return JSON.stringify({ version: SCHEMA_VERSION, exportedAt: Date.now(), lines }, null, 2);
}

/** Plain-text export: one line's text per line, for TXT export. */
export function exportLinesAsText(lines: StoredLine[]): string {
  return lines.map((l) => l.text).join('\n');
}

/** Parses a previously exported JSON payload back into StoredLine[]. */
export function importLinesFromJson(json: string): StoredLine[] {
  const parsed = JSON.parse(json);
  const raw = Array.isArray(parsed) ? parsed : parsed?.lines;
  if (!Array.isArray(raw)) throw new Error('Invalid KEI export file');
  return raw.map(coerceLine);
}

export function makeLine(text: string): StoredLine {
  const now = Date.now();
  return { id: makeId(), text, createdAt: now, updatedAt: now };
}

export { makeId };
