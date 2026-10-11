// Campaign / outcome / role filters, and the legend fallback for screens too small
// to read the cartouche on the plate.
import { events, campaigns, state, setFilters, subscribe } from "./store.js";
import { TIERS, KIND } from "./vocab.js";
import { KEYS } from "./plate.js";

const $ = (id) => document.getElementById(id);

export function initFilters() {
  const camp = $("fcamp"), out = $("fout"), role = $("frole");
  for (const c of campaigns) camp.add(new Option(c.name, c.id));

  const push = () => setFilters({ camp: camp.value, out: out.value, role: role.value });
  for (const sel of [camp, out, role]) sel.onchange = push;
  $("fclear").onclick = () => {
    camp.value = out.value = role.value = "";
    push();
  };

  buildLegend();
  subscribe(render);
  render();
}

function render() {
  $("fcount").textContent = state.view.length === events.length
    ? `${events.length} stops`
    : `${state.view.length} of ${events.length} stops`;
}

// the same KEYS that drive the cartouche, rendered as list items; one array, two renderings.
// The tick shapes are a separate key: they live on the timeline, not on the plate, so the
// cartouche does not explain them.
function buildLegend() {
  const ul = $("legend");
  const frag = document.createDocumentFragment();

  const kinds = document.createElement("li");
  kinds.className = "kind-key";
  kinds.append("On the timeline:");
  for (const [k, label] of Object.entries(KIND)) {
    const span = document.createElement("span");
    const i = document.createElement("i");
    i.className = `tk k-${k}`;
    span.append(i, label.toLowerCase());
    kinds.append(span);
  }
  ul.prepend(kinds);
  for (const d of KEYS) {
    if (d.sub) continue;
    const li = document.createElement("li");
    li.className = "key-item" + (d.k === "milestone" ? " m" : "");
    const i = document.createElement("i");
    if (d.size !== undefined) {
      const px = Math.round(TIERS[d.size].r * 1.5);
      i.style.cssText = `background:var(--muted);width:${px}px;height:${px}px`;
    } else if (d.k === "route") {
      i.className = "rl";
    } else {
      i.style.background = `var(--${d.k})`;
    }
    li.append(i, d.size !== undefined ? `${d.l} engaged` : d.l);
    frag.append(li);
  }
  ul.prepend(frag);
}
