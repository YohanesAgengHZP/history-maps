// Reflection panels for a few turning points. The whole point of this view is the split
// between what is on the record and what is argument about it, so the two never share a list.
import { events, state, subscribe } from "./store.js";
import reflections from "../data/reflections.json";

const $ = (id) => document.getElementById(id);

export function initReflection() {
  subscribe(render);
  render();
}

function render() {
  const e = events[state.current];
  const r = reflections[e.t];
  const box = $("reflection");
  box.hidden = !r;
  if (!r) return;

  $("reflectionSummary").textContent = r.question;

  const body = $("reflectionBody");
  body.textContent = "";
  body.append(
    group("On the record", r.established, "established"),
    group("Where historians differ", r.interpretation, "interpretation")
  );

  if (r.sources?.length) {
    const p = document.createElement("p");
    p.className = "refl-sources";
    p.textContent = "Leaning on: " + r.sources.join("; ");
    body.append(p);
  }
}

function group(heading, items, cls) {
  const sec = document.createElement("section");
  sec.className = "refl " + cls;

  const h = document.createElement("h4");
  h.textContent = heading;
  sec.append(h);

  const ul = document.createElement("ul");
  for (const text of items) {
    const li = document.createElement("li");
    li.textContent = text;
    ul.append(li);
  }
  sec.append(ul);
  return sec;
}
