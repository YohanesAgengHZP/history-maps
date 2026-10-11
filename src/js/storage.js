// Safari throws on Web Storage rather than returning null: with cookies blocked, or in
// some private-browsing configurations, even *reading* localStorage raises a SecurityError.
// theme.js reads it during boot, so an unguarded call takes the whole page down before the
// map is built. These wrappers degrade to "no preference remembered" instead.
const safe = (area) => {
  try {
    const s = window[area];
    const probe = "__probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
};

const make = (area) => {
  const s = safe(area);
  const fallback = new Map();     // lasts the page, which is better than crashing
  return {
    get(k) {
      try { return s ? s.getItem(k) : fallback.get(k) ?? null; }
      catch { return fallback.get(k) ?? null; }
    },
    set(k, v) {
      try { s ? s.setItem(k, v) : fallback.set(k, v); }
      catch { fallback.set(k, v); }
    },
    remove(k) {
      try { s ? s.removeItem(k) : fallback.delete(k); }
      catch { fallback.delete(k); }
    }
  };
};

export const store = make("localStorage");
export const session = make("sessionStorage");
