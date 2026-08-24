// ============================================================
// KEI — dimensions & touch targets
// ============================================================
// Apple/Android accessibility guidelines both converge around ~44dp as
// the minimum comfortable touch target — the *visible* key can be
// smaller, but the tappable area (via hitSlop) should not be.
export const MIN_TOUCH_TARGET = 44;

export const KEY_HEIGHT = 42;
export const KEY_MIN_WIDTH = 30;
export const KEY_MAX_WIDTH = 44;
export const KEY_MARGIN = 2;
export const KEYBOARD_HORIZONTAL_PADDING = 8;

export const spacing = { xs: 2, sm: 4, md: 8, lg: 12, xl: 16 };
export const radius = { sm: 5, md: 8, lg: 15 };
export const fontSize = { xs: 9, sm: 11, md: 13, lg: 15 };

/**
 * Computes a per-key width for a keyboard row given the screen width and
 * the longest row in the current layer, clamped to a comfortable range.
 */
export function computeKeyWidth(screenWidth: number, longestRowLength: number): number {
  const usable = screenWidth - KEYBOARD_HORIZONTAL_PADDING;
  const raw = usable / Math.max(1, longestRowLength) - KEY_MARGIN * 2;
  return Math.max(KEY_MIN_WIDTH, Math.min(KEY_MAX_WIDTH, Math.floor(raw)));
}

/**
 * hitSlop to pad a visually-small key up to MIN_TOUCH_TARGET without
 * changing its rendered size.
 */
export function hitSlopFor(visibleSize: number) {
  const pad = Math.max(0, Math.ceil((MIN_TOUCH_TARGET - visibleSize) / 2));
  return { top: pad, bottom: pad, left: pad, right: pad };
}
