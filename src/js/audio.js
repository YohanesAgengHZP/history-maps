// Optional sound, off by default and never autoplaying.
//
// There are no audio files here. Everything is synthesised with the Web Audio API, which
// keeps the page a single self-contained file and sidesteps the licensing trap in recorded
// music: an 1792 melody is public domain, but a modern *recording* of it is not.
//
// The tune is the top voice of a CC0 MIDI of La Marseillaise (see anthem.json), rendered
// as a music box rather than a band — which is also a period instrument: the musical box
// mechanism was devised by the Geneva watchmaker Antoine Favre in 1796.
import anthem from "../data/anthem.json";
import { store } from "./storage.js";

const KEY = "eaglesroad.sound";
const $ = (id) => document.getElementById(id);

let ctx = null, master = null, playing = false, timer = null, startedAt = 0;

export const soundOn = () => store.get(KEY) === "1";

export function initAudio() {
  const btn = $("sound");
  if (!btn) return;

  btn.onclick = () => {
    const next = !soundOn();
    store.set(KEY, next ? "1" : "0");
    next ? begin() : stop();
    paint(btn);
  };
  paint(btn);

  // a tab in the background should not keep playing
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && playing) stop();
    else if (!document.hidden && soundOn() && !playing) begin();
  });
}

function paint(btn) {
  const on = soundOn();
  btn.setAttribute("aria-pressed", String(on));
  btn.title = on ? "Sound on — La Marseillaise, 1792" : "Play a music-box setting of La Marseillaise (1792)";
  $("soundOn").style.display = on ? "" : "none";
  $("soundOff").style.display = on ? "none" : "";
}

function begin() {
  // the AudioContext can only be created from a gesture, which is why this lives in the click
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();

  master = ctx.createGain();
  master.gain.value = 0;
  master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.2); // fade in, never a jolt
  master.connect(ctx.destination);

  playing = true;
  startedAt = ctx.currentTime + 0.25;
  schedule();
  timer = setInterval(schedule, 2000);
}

function stop() {
  playing = false;
  clearInterval(timer);
  timer = null;
  if (!master || !ctx) return;
  const g = master, t = ctx.currentTime;
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(g.gain.value, t);
  g.gain.linearRampToValueAtTime(0, t + 0.6);
  setTimeout(() => g.disconnect(), 900);
  master = null;
}

// Notes are scheduled a little ahead of the clock rather than fired from a timer, because
// setInterval drifts and the ear hears drift immediately.
const LOOKAHEAD = 2.5;
const GAP = 3;              // silence between repeats
let cursor = 0;

function schedule() {
  if (!playing || !ctx) return;
  const span = anthem.notes[anthem.notes.length - 1];
  const loop = span[0] + span[2] + GAP;
  const until = ctx.currentTime + LOOKAHEAD;

  while (startedAt + cursor * loop < until) {
    const base = startedAt + cursor * loop;
    for (const [t, pitch, dur] of anthem.notes) {
      const at = base + t;
      if (at > until || at < ctx.currentTime - 0.1) continue;
      pluck(at, 440 * Math.pow(2, (pitch - 69) / 12), dur);
    }
    if (base + loop < until) cursor++;
    else break;
  }
}

// one music-box tine: a struck sine with a fast attack and a long decay, plus a quiet
// octave above for the metallic edge
function pluck(at, freq, dur) {
  const g = ctx.createGain();
  g.connect(master);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(0.9, at + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(dur, 0.35) + 0.9);

  for (const [mult, level, type] of [[1, 1, "sine"], [2, 0.18, "sine"], [3.01, 0.05, "triangle"]]) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq * mult;
    const og = ctx.createGain();
    og.gain.value = level;
    o.connect(og).connect(g);
    o.start(at);
    o.stop(at + Math.max(dur, 0.35) + 1.0);
  }
}
