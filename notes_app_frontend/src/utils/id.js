//
// PUBLIC_INTERFACE
export function generateId() {
  /** Generate a reasonably unique ID string for notes. */
  const part = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36);
  return `${time}-${part}`;
}
