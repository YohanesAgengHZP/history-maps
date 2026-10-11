// Bootstrap. Nothing here knows how any one view works; it just wires them together.
import "leaflet/dist/leaflet.css";
import "../styles/base.css";
import "../styles/map.css";
import "../styles/panel.css";
import "../styles/timeline.css";

import { initMap, resetView, zoomBy } from "./map.js";
import { initPlate } from "./plate.js";
import { initPanel } from "./panel.js";
import { initTimeline } from "./timeline.js";
import { initFilters } from "./filters.js";
import { initJourney } from "./journey.js";
import { initLayers } from "./layers.js";
import { initArchive } from "./archive.js";
import { initReflection } from "./reflection.js";
import { initLetters } from "./letters.js";
import { initIntro } from "./intro.js";
import { initTheme } from "./theme.js";
import { initAudio } from "./audio.js";
import { events, phases, campaigns, select } from "./store.js";
import { OUTCOME, ROLE, KIND } from "./vocab.js";

initTheme();   // first, so the page never flashes the wrong palette
initMap(document.getElementById("map"));
initPlate(document.getElementById("frame"));
initPanel();
initTimeline();
initFilters();
initJourney();
initLayers();
initArchive();
initReflection();
initLetters();
initAudio();

document.getElementById("zin").onclick = () => zoomBy(0.6);
document.getElementById("zout").onclick = () => zoomBy(-0.6);
document.getElementById("zreset").onclick = resetView;

select(0);
initIntro();   // last: it decides whether to greet, and needs the first stop already chosen

/* ---------- data self-check: every stop needs a campaign, sources, and a place ---------- */
(function check() {
  const camps = new Set(campaigns.map((c) => c.id));
  const bad = events.filter((e) =>
    !camps.has(e.camp) || !e.src?.length || !(e.ll || e.cll) ||
    (e.np && !ROLE[e.np]) || !OUTCOME[e.o] || !KIND[e.kind] || !phases.some((p) => p.id === e.p) ||
    (e.men !== undefined && !(e.men > 0)));
  if (bad.length) console.warn("incomplete stops:", bad.map((e) => e.t));

  const years = events.map((e) => +e.y);
  for (let i = 1; i < years.length; i++) {
    if (years[i] < years[i - 1]) console.warn("out of order:", events[i].t);
  }
  // battles without a strength figure are fine only if they are campaigns, not single actions
  const noMen = events.filter((e) => e.o !== "milestone" && !e.men).map((e) => e.t);
  if (noMen.length) console.info("no forces figure (campaign entries):", noMen);
})();
