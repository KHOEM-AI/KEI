// ============================================================
// KEI Storage — debounced save hook
// ============================================================
import { useEffect, useRef, useState } from 'react';
import { StoredLine, SaveStatus } from '../types';
import { saveLines, SAVE_DEBOUNCE_MS } from './storage';

/**
 * Persists `lines` a short idle period after the last change, instead of
 * on every keystroke-driven update (audit item 31). Exposes a status the
 * UI can surface ("Saving…" / "Saved" / "Save failed") per audit item 36.
 */
export function useDebouncedSave(lines: StoredLine[], loaded: boolean): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loaded) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus('saving');
    timeoutRef.current = setTimeout(async () => {
      const ok = await saveLines(lines);
      setStatus(ok ? 'saved' : 'error');
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [lines, loaded]);

  // Flush on unmount so a fast navigate-away doesn't drop the last edit.
  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      saveLines(lines).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return status;
}
