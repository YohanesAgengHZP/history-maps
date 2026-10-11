// One-shot: lift the data out of the old single-file napoleon-map.html into src/data/*.json.
// Run from the repo root:  node tools/extract-data.mjs <path-to-old-html>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const src = readFileSync(process.argv[2] ?? "napoleon-map.html", "utf8");

const grab = (name, re) => {
  const m = src.match(re);
  if (!m) throw new Error("could not find " + name);
  return m[0];
};

const decls = [
  grab("LAND", /^const LAND = .*;$/m),
  grab("PHASES", /const PHASES = \[[\s\S]*?\n\];/),
  grab("OUTCOME", /const OUTCOME = \{.*?\};/),
  grab("TIERS", /const TIERS = \[[\s\S]*?\n\];/),
  grab("CAMPAIGNS", /const CAMPAIGNS = \[[\s\S]*?\n\];/),
  grab("ROLE", /const ROLE = \{[\s\S]*?\n\};/),
  grab("EVENTS", /const EVENTS = \[[\s\S]*?\n\];/),
  grab("SEAS", /const SEAS = \[[\s\S]*?\n\];/)
].join("\n");

// new Function evaluates the declarations above. That is safe here and only here: this is a
// one-shot local tool whose single input is a file from this repo. Never point it at a file
// you did not write, and never ship this pattern into the app.
const data = new Function(
  decls + "\nreturn {LAND, PHASES, OUTCOME, TIERS, CAMPAIGNS, ROLE, EVENTS, SEAS};"
)();

const hach = src.match(/const HACH_XY = "([^"]*)", HACH_W = "([^"]*)";/);
if (!hach) throw new Error("could not find hachure blobs");

mkdirSync("src/data", { recursive: true });
const out = (file, value, pretty) =>
  writeFileSync(`src/data/${file}`, JSON.stringify(value, null, pretty ? 1 : 0));

// mapshaper winds its rings the opposite way to d3. The old file flipped them at runtime;
// Leaflet fills with fill-rule evenodd and does not care, so the data is stored as mapshaper left it.
out("land.json", data.LAND, false);
out("hachures.json", { xy: hach[1], w: hach[2] }, false);
out("events.json", data.EVENTS, true);
out("campaigns.json", { phases: data.PHASES, campaigns: data.CAMPAIGNS }, true);
out("seas.json", data.SEAS, true);
out("vocabulary.json", { outcome: data.OUTCOME, role: data.ROLE, tiers: data.TIERS }, true);

console.log(
  `events ${data.EVENTS.length}, phases ${data.PHASES.length}, campaigns ${data.CAMPAIGNS.length}, ` +
  `seas ${data.SEAS.length}, land geometries ${data.LAND.geometries.length}, ` +
  `hachure strokes ${atob(hach[2]).length}`
);
