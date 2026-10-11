// The archive drawer. Every field comes from a catalogue record (see tools/research-archive.py
// and tools/curate-archive.py); nothing is written from memory, and no images are embedded —
// entries link out to the holding institution, or to the verified Commons record.
import { events, state, subscribe } from "./store.js";
import archive from "../data/archive.json";
import sources from "../data/sources.json";

const $ = (id) => document.getElementById(id);

export function initArchive() {
  subscribe(render);
  render();
}

export const hasArchive = (title) => Boolean(archive[title]?.length);

const FOUGHT = new Set(["battle", "siege"]);

function render() {
  const e = events[state.current];
  const items = archive[e.t];
  const box = $("archive");
  const body = $("archiveBody");

  // For an engagement with nothing sourced, say so rather than hiding the drawer: the
  // absence of evidence is itself worth stating. For a non-battle, there is nothing to explain.
  if (!items?.length) {
    box.hidden = !FOUGHT.has(e.kind);
    if (!box.hidden) {
      body.textContent = "";
      const p = document.createElement("p");
      p.className = "archive-foot";
      p.textContent = "No period plan or archival document was found for this engagement in the " +
        "collections searched, and no tactical reconstruction is drawn in its place.";
      body.append(p);
    }
    return;
  }

  box.hidden = false;
  body.textContent = "";

  const lead = document.createElement("p");
  lead.className = "archive-foot archive-lead";
  lead.textContent = "Period plans and engravings held by public collections. " +
    "No troop positions are plotted: a scanned plan is not a georeferenced dataset.";
  body.append(lead);

  for (const it of items) body.append(entry(it));

  const foot = document.createElement("p");
  foot.className = "archive-foot";
  foot.textContent = sources.archive.linking;
  body.append(foot);
}

function entry(it) {
  const li = document.createElement("div");
  li.className = "arch";

  const h = document.createElement("h4");
  h.textContent = it.title;
  li.append(h);

  const meta = document.createElement("p");
  meta.className = "arch-meta";
  meta.textContent = [it.date, it.creator, it.institution].filter(Boolean).join(" · ");
  li.append(meta);

  const tags = document.createElement("p");
  tags.className = "arch-tags";
  const nature = document.createElement("span");
  // a contemporary plan and a later engraving are different kinds of evidence
  nature.className = "tag " + (it.nature === "contemporary" ? "is-contemporary" : "is-later");
  nature.textContent = it.nature === "contemporary" ? "Contemporary document" : "Later depiction";
  const lic = document.createElement("span");
  lic.className = "tag";
  lic.textContent = it.licence;
  tags.append(nature, lic);
  li.append(tags);

  const links = document.createElement("p");
  links.className = "arch-links";
  if (it.catalogue) links.append(link(it.catalogue, labelFor(it.catalogue)));
  links.append(link(it.commons, "Wikimedia Commons"));
  li.append(links);

  return li;
}

// name the link for what it actually is: a Wikidata item is not a museum catalogue,
// and a handle is a persistent identifier rather than a page
function labelFor(url) {
  if (url.includes("wikidata.org")) return "Wikidata record";
  if (url.includes("hdl.handle.net")) return "Persistent identifier";
  return "Catalogue record";
}

function link(href, text) {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = text;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}
