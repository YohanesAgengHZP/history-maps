// The chronological track: one tick per stop, grouped by phase.
// The Play control belongs to journey.js; this module only reflects and drives selection.
import { events, phases, state, subscribe, select, step, isVisible } from "./store.js";

const $ = (id) => document.getElementById(id);
const ticks = [];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initTimeline() {
  const track = $("track");
  phases.forEach((ph) => {
    const wrap = document.createElement("div");
    wrap.className = "phase";

    const name = document.createElement("div");
    name.className = "phase-name";
    const b = document.createElement("b");
    b.textContent = ph.name;
    const range = document.createElement("span");
    range.className = "range";
    range.textContent = ph.range;
    name.append(b, range);

    const row = document.createElement("div");
    row.className = "ticks";
    events.forEach((e, i) => {
      if (e.p !== ph.id) return;
      const t = document.createElement("button");
      t.type = "button";
      t.className = `tick o-${e.o} k-${e.kind}`;
      t.setAttribute("aria-label", `${e.y}: ${e.t}`);
      t.title = `${e.y}: ${e.t}`;
      t.tabIndex = -1; // roving: only the selected tick is in the tab order
      t.onclick = () => select(i);
      row.append(t);
      ticks[i] = t;
    });

    wrap.append(name, row);
    track.append(wrap);
  });

  // one keyboard handler for the whole track, so the ticks are a single tab stop
  // instead of thirty-nine. stopPropagation keeps the document-level arrow keys
  // in panel.js from stepping a second time.
  track.addEventListener("keydown", (ev) => {
    const keys = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 };
    if (ev.key in keys) step(keys[ev.key]);
    else if (ev.key === "Home") select(state.view[0]);
    else if (ev.key === "End") select(state.view[state.view.length - 1]);
    else return;
    ev.preventDefault();
    ev.stopPropagation();
    ticks[state.current]?.focus();
  });

  subscribe(render);
  render();
}

function render() {
  ticks.forEach((t, i) => {
    t.classList.toggle("visited", i <= state.current);
    t.classList.toggle("off", !isVisible(i));
    const selected = i === state.current;
    t.setAttribute("aria-current", selected ? "true" : "false");
    t.tabIndex = selected ? 0 : -1;
  });

  const sc = $("trackScroll"), t = ticks[state.current];
  if (t) {
    sc.scrollTo({
      left: t.offsetLeft - sc.clientWidth / 2 + t.offsetWidth / 2,
      behavior: reduceMotion ? "auto" : "smooth"
    });
  }
}

