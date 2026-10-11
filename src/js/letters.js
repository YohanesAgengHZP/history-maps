// Letters to Joséphine, attached to the stop each was written from or about.
//
// Every word is sliced out of Henry Foljambe Hall's 1901 translation (Project Gutenberg
// 37499) by tools/extract-letters.py — nothing here is retyped, which matters because the
// versions circulating online are quietly corrupt. One widely copied blog text of the
// Marmirolo letter reads "I urge your strongly" and "proves who false"; the edition reads
// "you strongly" and "how false".
//
// Napoleon is also one of the most misquoted figures in history. If you add to this, take
// the words from a scholarly edition, not from a quotations site.
import { events, state, subscribe } from "./store.js";
import letters from "../data/letters.json";

const $ = (id) => document.getElementById(id);

export function initLetters() {
  subscribe(render);
  render();
}

function render() {
  const e = events[state.current];
  const l = letters.letters[e.t];
  const box = $("letter");
  box.hidden = !l;
  if (!l) return;

  $("letterSummary").textContent = `Letter to Joséphine, ${l.date}`;

  const body = $("letterBody");
  body.textContent = "";

  const head = document.createElement("p");
  head.className = "lt-head";
  head.textContent = `${l.place}, ${l.date}`;
  body.append(head);

  const quote = document.createElement("blockquote");
  quote.className = "lt-body";
  for (const para of l.paragraphs) {
    const p = document.createElement("p");
    p.textContent = para;
    quote.append(p);
  }
  const sign = document.createElement("p");
  sign.className = "lt-sign";
  sign.textContent = l.signed;
  quote.append(sign);
  body.append(quote);

  const note = document.createElement("p");
  note.className = "lt-note";
  note.textContent = l.note;
  body.append(note);

  const src = document.createElement("p");
  src.className = "lt-src";
  const s = letters.source;
  src.append(`Translated by ${s.translator}, ${s.published}, in ${s.work}. Text from `);
  const a = document.createElement("a");
  a.href = s.url;
  a.textContent = s.via;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  src.append(a, ".");
  body.append(src);
}
