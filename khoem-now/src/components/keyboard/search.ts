// ============================================================
// KEI Utils — search
// ============================================================
import { StoredLine } from '../types';
import { normalizeForSearch } from '../editor/unicode';

export function searchLines(lines: StoredLine[], query: string): StoredLine[] {
  if (!query.trim()) return lines;
  const q = normalizeForSearch(query);
  return lines.filter((line) => normalizeForSearch(line.text).includes(q));
}
