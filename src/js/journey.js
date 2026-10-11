// The guided journey: a presentation mode over the same data the map already shows.
// It never takes navigation away from the user — selecting anything while it runs
// pauses the tour where it stands rather than restarting or exiting it.
import { state, subscribe, select, step, positionInView, setJourney } from "./store.js";

const STEP_MS = 3600;
const $ = (id) => document.getElementById(id);
let timer = null;

const clear = () => { clearInterval(timer); timer = null; };

const schedule = () => {
  clear();
  timer = setInterval(() => {
    const at = positionInView();
    if (at === -1 || at >= state.view.length - 1) return finish();
    select(state.view[at + 1], true);
  }, STEP_MS);
};

export function start() {
  if (!state.view.length) return;
  if (positionInView() >= state.view.length - 1) select(state.view[0], true);
  setJourney({ active: true, paused: false });
  schedule();
}

export function pause() {
  if (!state.journey.active || state.journey.paused) return;
  clear();
  setJourney({ paused: true });
}

export function resume() {
  if (!state.journey.active || !state.journey.paused) return;
  setJourney({ paused: false });
  schedule();
}

export function exit() {
  clear();
  setJourney({ active: false, paused: false });
}

// reaching the last stop ends the tour but leaves you on it, rather than snapping away
function finish() {
  clear();
  setJourney({ active: false, paused: false });
}

export function initJourney() {
  // the main button carries play / pause / resume; the bar carries the rest
  $("play").onclick = () => {
    const { active, paused } = state.journey;
    if (!active) start();
    else if (paused) resume();
    else pause();
  };
  $("jprev").onclick = () => step(-1);
  $("jnext").onclick = () => step(1);
  $("jexit").onclick = exit;

  subscribe(({ type, fromJourney }) => {
    // a manual move during the tour pauses it; it does not end it
    if (type === "select" && !fromJourney && state.journey.active) pause();
    if (type === "filter" && state.journey.active) pause();
    render();
  });
  render();
}

function render() {
  const { active, paused } = state.journey;
  document.body.classList.toggle("in-journey", active);

  $("play").textContent = !active ? "Play the journey" : paused ? "Resume" : "Pause";
  $("journey").hidden = !active;
  if (!active) return;

  const at = positionInView();
  $("jprev").disabled = at <= 0;
  $("jnext").disabled = at === -1 || at >= state.view.length - 1;
  $("jstatus").textContent = paused
    ? "Paused"
    : `Stop ${at + 1} of ${state.view.length}`;
}
