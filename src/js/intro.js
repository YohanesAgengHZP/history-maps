// The opening card and the closing chapter. Both are plain overlays on the plate rather
// than route changes, so the map underneath keeps its state and nothing has to be rebuilt.
import { state, events, subscribe, select } from "./store.js";
import { start as startJourney } from "./journey.js";

const $ = (id) => document.getElementById(id);
const SEEN = "eaglesroad.introSeen";
let lastFocus = null;

export function initIntro() {
  const intro = $("intro"), outro = $("outro");

  $("introExplore").onclick = () => close(intro);
  $("introPlay").onclick = () => { close(intro); startJourney(); };
  $("outroClose").onclick = () => close(outro);
  $("outroRestart").onclick = () => { close(outro); select(state.view[0]); };

  for (const el of [intro, outro]) {
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") { ev.stopPropagation(); close(el); }
      if (ev.key === "Tab") trapFocus(ev, el);
    });
  }

  // sessionStorage, not localStorage: the card should greet her again on a fresh visit,
  // but not every time she reloads while reading
  if (!sessionStorage.getItem(SEEN)) open(intro);

  // the closing chapter arrives when the tour ends on the last stop, not merely when
  // someone clicks the final marker
  let wasRunning = false;
  subscribe(({ type }) => {
    if (type !== "journey") return;
    const running = state.journey.active;
    const finished = wasRunning && !running && state.current === events.length - 1;
    wasRunning = running;
    if (finished) open(outro);
  });
}

function open(el) {
  lastFocus = document.activeElement;
  el.hidden = false;
  if (el.id === "intro") sessionStorage.setItem(SEEN, "1");
  el.querySelector("button")?.focus();
}

function close(el) {
  el.hidden = true;
  lastFocus?.focus?.();
}

// keeps Tab inside the card while it is open
function trapFocus(ev, el) {
  const items = [...el.querySelectorAll("button, [href]")].filter((n) => !n.disabled);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
  else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
}
