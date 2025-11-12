//
// PUBLIC_INTERFACE
export function debounce(fn, delay = 400) {
  /** Debounce a function call. Returns a function that delays invoking fn. */
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
