// The frontiers layer control. Only years with a verified snapshot are offered;
// nothing is interpolated, and the dataset's own caveat is shown rather than buried.
import { BOUNDARY_YEARS, setBoundaryYear } from "./map.js";
import sources from "../data/sources.json";

const $ = (id) => document.getElementById(id);
let active = null;

export function initLayers() {
  const opts = $("layerOpts");
  const choices = [{ year: null, label: "Off", note: "" },
                   ...BOUNDARY_YEARS.map((b) => ({ year: b.year, label: String(b.year), note: b.note }))];

  for (const c of choices) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "layer-opt";
    b.textContent = c.label;
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", String(c.year === active));
    b.onclick = () => choose(c.year);
    b.dataset.year = c.year ?? "";
    opts.append(b);
  }
  choose(null);
}

// switching the layer must not disturb the selected stop, the zoom or the timeline
function choose(year) {
  active = year;
  setBoundaryYear(year);
  for (const b of document.querySelectorAll(".layer-opt")) {
    b.setAttribute("aria-checked", String((b.dataset.year ? Number(b.dataset.year) : null) === year));
  }
  const note = $("layerNote");
  if (!year) {
    note.textContent = `Snapshots for ${BOUNDARY_YEARS.map((b) => b.year).join(" and ")} only.`;
    return;
  }
  const snap = BOUNDARY_YEARS.find((b) => b.year === year);
  note.textContent = `${snap.note} Outlines are approximate — see the dossier sources.`;
  note.title = sources.boundaries.caveat;
}
