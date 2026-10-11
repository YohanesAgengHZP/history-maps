// The one place that knows which stop is selected and which stops the filters allow.
// Views subscribe; nothing reaches into anything else's DOM.
import events from "../data/events.json";
import catalogue from "../data/campaigns.json";

export const { phases, campaigns } = catalogue;
export { events };

const listeners = new Set();
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = (type, extra = {}) => listeners.forEach((fn) => fn({ type, ...extra }));

export const state = {
  current: 0,
  view: events.map((_, i) => i),
  filters: { camp: "", out: "", role: "" },
  // the guided journey. Lives here rather than in journey.js so map.js can read it
  // without the two modules importing each other.
  journey: { active: false, paused: false }
};

export function setJourney(patch) {
  Object.assign(state.journey, patch);
  emit("journey");
}

const matches = (e) =>
  (!state.filters.camp || e.camp === state.filters.camp) &&
  (!state.filters.out || e.o === state.filters.out) &&
  (!state.filters.role || e.np === state.filters.role);

export const isVisible = (i) => matches(events[i]);
export const positionInView = () => state.view.indexOf(state.current);

// fromJourney marks a move the tour made itself, so views can tell it apart from a
// click or a key press and avoid tearing the tour down underneath the user.
export function select(i, fromJourney = false) {
  state.current = Math.max(0, Math.min(events.length - 1, i));
  emit("select", { fromJourney });
}

export function setFilters(next) {
  Object.assign(state.filters, next);
  state.view = events.reduce((acc, e, i) => (matches(e) && acc.push(i), acc), []);
  emit("filter");
  // an empty combination is allowed: keep the current stop on screen and let the views say so
  select(state.view.includes(state.current) || !state.view.length ? state.current : state.view[0]);
}

// move by one filtered stop, not one raw index
export function step(dir) {
  if (!state.view.length) return;
  const at = positionInView();
  if (at === -1) return select(state.view[0]);
  const next = at + dir;
  if (next >= 0 && next < state.view.length) select(state.view[next]);
}

export const visibleEvents = () => state.view.map((i) => events[i]);
export const travelledEvents = () => state.view.filter((i) => i <= state.current).map((i) => events[i]);
