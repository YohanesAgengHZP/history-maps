// The map layer: Leaflet for pan and zoom, a Lambert conformal conic CRS so the sheet keeps
// the projection the plate was drawn for, and plain SVG layers for everything on it.
import L from "leaflet";
import proj4 from "proj4";
import land from "../data/land.json";
import hachures from "../data/hachures.json";
import seas from "../data/seas.json";
import boundaries1800 from "../data/boundaries-1800.json";
import boundaries1815 from "../data/boundaries-1815.json";
import { events, state, select, subscribe, isVisible, visibleEvents, travelledEvents } from "./store.js";
import { radius, toLatLng } from "./vocab.js";

// Lambert conformal conic, standard parallels 35N/58N, central meridian 14E. Leaflet is Web
// Mercator by default; without this the whole engraved sheet would be the wrong shape.
const PROJ = "+proj=lcc +lat_1=35 +lat_2=58 +lat_0=46 +lon_0=14 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs";
const tx = proj4("WGS84", PROJ);
const M_PER_PX_AT_Z0 = 10000;
const OFFSET = 6e6; // shifts projected metres positive so Leaflet's pixel origin behaves

const PlateCRS = L.extend({}, L.CRS.Earth, {
  wrapLng: null,
  wrapLat: null,
  infinite: true,
  projection: {
    project: (ll) => { const [x, y] = tx.forward([ll.lng, ll.lat]); return new L.Point(x, y); },
    unproject: (p) => { const [lng, lat] = tx.inverse([p.x, p.y]); return new L.LatLng(lat, lng); },
    bounds: L.bounds([-OFFSET, -OFFSET], [OFFSET, OFFSET])
  },
  transformation: new L.Transformation(1, OFFSET, -1, OFFSET),
  scale: (z) => Math.pow(2, z) / M_PER_PX_AT_Z0,
  zoom: (s) => Math.log(s * M_PER_PX_AT_Z0) / Math.LN2
});

// Only these two years exist in the boundary dataset. Nothing is interpolated between them:
// there is no verified snapshot for 1805, 1812 or 1813, so none is offered.
export const BOUNDARY_YEARS = [
  { year: 1800, data: boundaries1800, note: "Before the Empire: the Consulate, the sister republics, the Holy Roman Empire still standing." },
  { year: 1815, data: boundaries1815, note: "After the Congress of Vienna: the settlement that replaced the Empire." }
];

export let map;
let homeBounds, minZoom;
let boundaryLayer = null;
const markers = new Map();
let routeFull, routeDone, routeHead, labelMarker;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const onMap = events.map((e, i) => ({ e, i })).filter(({ e }) => e.ll);

function graticule(step = 5) {
  const lines = [];
  for (let lon = -40; lon <= 70; lon += step) {
    const pts = [];
    for (let lat = 8; lat <= 78; lat += 1) pts.push([lat, lon]);
    lines.push(pts);
  }
  for (let lat = 10; lat <= 75; lat += step) {
    const pts = [];
    for (let lon = -40; lon <= 70; lon += 1) pts.push([lat, lon]);
    lines.push(pts);
  }
  return lines;
}

// HACH_XY packs [lon0,lat0,lon1,lat1] per stroke as little-endian int16 hundredths of a degree;
// w is one slope class (0..2) per stroke. Degrees, not pixels, so the strokes survive a
// change of projection. See tools/hachures.py.
function hachureSegments() {
  const bytes = (s) => {
    const b = atob(s), u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return u;
  };
  const xy = bytes(hachures.xy), w = bytes(hachures.w);
  const dv = new DataView(xy.buffer, xy.byteOffset, xy.byteLength);
  const byClass = [[], [], []];
  for (let i = 0; i < w.length; i++) {
    byClass[w[i]].push([
      [dv.getInt16(i * 8 + 2, true) / 100, dv.getInt16(i * 8, true) / 100],
      [dv.getInt16(i * 8 + 6, true) / 100, dv.getInt16(i * 8 + 4, true) / 100]
    ]);
  }
  return byClass;
}

export function initMap(el) {
  map = L.map(el, {
    crs: PlateCRS,
    zoomSnap: 0,
    zoomDelta: 0.6,
    // scrollWheelZoom is replaced below; see attachWheelZoom
    scrollWheelZoom: false,
    zoomControl: false,
    attributionControl: false,
    inertia: false,
    // with only three levels, the rubber-band at the limits reads as a glitch
    bounceAtZoomLimits: false,
    renderer: L.svg({ padding: 0.4 })
  });

  // above the land fill, below the markers, so outlines never bury a stop
  map.createPane("boundaries").style.zIndex = 405;

  L.polyline(graticule(), { className: "grat", interactive: false }).addTo(map);

  // one outline, stroked five times at shrinking widths, alternating coast and sea colours
  [["water-line", 17], ["water-gap", 13.5], ["water-line", 10.5], ["water-gap", 7], ["water-line", 4.5]]
    .forEach(([cls, weight], i) =>
      L.geoJSON(land, {
        className: `${cls} w${i}`, interactive: false, fill: false, weight,
        opacity: cls === "water-gap" ? 1 : [0.3, 0, 0.38, 0, 0.48][i]
      }).addTo(map));

  L.geoJSON(land, { className: "land", interactive: false, fillOpacity: 1, weight: 0.8 }).addTo(map);

  hachureSegments().forEach((segs, i) =>
    L.polyline(segs, { className: `hach hach-${i}`, interactive: false, smoothFactor: 0 }).addTo(map));

  seas.forEach((s) =>
    L.marker(toLatLng(s.ll), {
      interactive: false,
      icon: L.divIcon({ className: "sea-label", html: s.n, iconSize: [160, 16] })
    }).addTo(map));

  routeFull = L.polyline([], { className: "route-full", interactive: false }).addTo(map);
  routeDone = L.polyline([], { className: "route-done", interactive: false }).addTo(map);
  routeHead = L.polyline([], { className: "route-head", interactive: false }).addTo(map);

  onMap.forEach(({ e, i }) => {
    const d = radius(e) * 2;
    const box = d + 16;
    // e.nudge pulls apart stops that share a spot: Paris, and Waterloo/Ligny/Quatre-Bras.
    // Shifting the icon anchor moves the symbol without moving the coordinate, so the
    // route and the coordinate readout stay on the true location.
    const [nx, ny] = e.nudge ?? [0, 0];
    const m = L.marker(toLatLng(e.ll), {
      keyboard: true,
      title: `${e.y}, ${e.t}`,
      icon: L.divIcon({
        className: `mk o-${e.o}${e.o === "milestone" ? " ms" : ""}`,
        html: `<i style="--d:${d}px"></i>`,
        iconSize: [box, box],
        iconAnchor: [box / 2 - nx, box / 2 - ny]
      })
    }).addTo(map);
    m.on("click", () => select(i));
    markers.set(i, m);
  });

  labelMarker = L.marker([0, 0], {
    interactive: false,
    icon: L.divIcon({ className: "map-label", html: "", iconSize: [1, 1], iconAnchor: [-14, 8] })
  }).addTo(map);

  // every stop, plus the two anchors the original plate was framed to. Widening these
  // zooms out, which squeezes the Paris and Waterloo clusters together: check marker
  // spacing (see CLAUDE.md) before changing them.
  const pts = onMap.map(({ e }) => toLatLng(e.ll));
  homeBounds = L.latLngBounds(pts).extend([36, -9.5]).extend([57.5, 40]);
  map.fitBounds(homeBounds, { padding: [34, 34] });
  minZoom = map.getZoom();
  map.setMinZoom(minZoom);
  map.setMaxZoom(minZoom + 3); // the old plate allowed 1x to 8x
  map.setMaxBounds(homeBounds.pad(0.4));
  attachWheelZoom(el);   // after min/max are known, since it clamps against them

  if (import.meta.env.DEV) window.__map = map; // for the headless checks only

  subscribe(({ type }) => {
    // starting the tour should ease in at once, not wait for the first advance
    if (type === "journey") {
      if (state.journey.active) moveCamera(events[state.current], true);
      else resetView();
      return;
    }
    if (type === "filter") applyVisibility();
    render(type === "select");
  });
  applyVisibility();
  render(false);
  return map;
}

/* A trackpad pinch and a mouse wheel both arrive as `wheel` events, but they are nothing
   alike: a pinch streams dozens of small deltas as the fingers move, a wheel sends a few
   large notches. Leaflet applies one sensitivity to both, so tuning it for the wheel makes
   the pinch leap in steps. This handler reads them separately and, crucially, zooms with
   `animate: false` so a pinch tracks the fingers instead of queueing an animation per event. */
function attachWheelZoom(el) {
  el.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    let dy = ev.deltaY;
    if (ev.deltaMode === 1) dy *= 16;        // reported in lines
    else if (ev.deltaMode === 2) dy *= 400;  // reported in pages

    // ctrlKey is how every browser reports a pinch, on a trackpad or a touchscreen
    const perPixel = ev.ctrlKey ? 1 / 110 : 1 / 180;
    const target = map.getZoom() - dy * perPixel;
    const clamped = Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), target));
    if (clamped === map.getZoom()) return;

    // zoom about the pointer, not the centre, so the map does not slide out from under it
    map.setZoomAround(map.mouseEventToContainerPoint(ev), clamped, { animate: false });
  }, { passive: false });
}

/* ---------- historical territorial layer ----------
   Two verified snapshots, drawn as outlines over the plate. Dependencies (where the
   dataset's SUBJECTO differs from NAME) get a faint wash, and boundaries the dataset
   itself calls approximate are dashed, so the map never looks more certain than its source. */
export function setBoundaryYear(year) {
  if (boundaryLayer) { map.removeLayer(boundaryLayer); boundaryLayer = null; }
  if (!year) return;
  const snapshot = BOUNDARY_YEARS.find((b) => b.year === year);
  if (!snapshot) return;

  boundaryLayer = L.geoJSON(snapshot.data, {
    pane: "boundaries",
    renderer: L.svg({ pane: "boundaries" }),
    style: (f) => {
      const p = f.properties || {};
      const dependent = p.SUBJECTO && p.NAME && p.SUBJECTO !== p.NAME;
      const approximate = Number(p.BORDERPRECISION) < 3;
      return { className: `bdy${dependent ? " dependent" : ""}${approximate ? " approximate" : ""}` };
    },
    onEachFeature: (f, layer) => {
      const p = f.properties || {};
      const name = p.NAME || "unnamed in the dataset";
      const under = p.SUBJECTO && p.SUBJECTO !== p.NAME ? ` — under ${p.SUBJECTO}` : "";
      const approx = Number(p.BORDERPRECISION) < 3 ? " · approximate border" : "";
      layer.bindTooltip(name + under + approx, { sticky: true, className: "bdy-tip" });
    }
  }).addTo(map);
}

export const resetView = () => map.fitBounds(homeBounds, { padding: [42, 42] });
export const zoomBy = (delta) => map.setZoom(map.getZoom() + delta);

function applyVisibility() {
  markers.forEach((m, i) => m.getElement()?.classList.toggle("off", !isVisible(i)));
}

function render(animate) {
  const current = events[state.current];

  markers.forEach((m, i) => {
    const el = m.getElement();
    if (!el) return;
    el.classList.toggle("current", i === state.current);
    el.classList.toggle("future", i > state.current);
  });
  markers.get(state.current)?.setZIndexOffset(1000);

  const ll = (e) => toLatLng(e.ll);
  const done = travelledEvents().filter((e) => e.ll);
  routeFull.setLatLngs(visibleEvents().filter((e) => e.ll).map(ll));

  const headIsNew = current.ll && done.length > 1;
  routeDone.setLatLngs((headIsNew ? done.slice(0, -1) : done).map(ll));
  routeHead.setLatLngs(headIsNew ? done.slice(-2).map(ll) : []);
  if (headIsNew && animate && !reduceMotion) animateHead();

  drawLabel(current);
  moveCamera(current, animate);
}

// The map follows the tour, but it must not yank the view while somebody is reading a
// dossier: outside the journey it only recentres if they have already zoomed in.
function moveCamera(e, animate) {
  if (!e.ll) return;
  const target = toLatLng(e.ll);
  const touring = state.journey.active;

  if (!touring) {
    if (map.getZoom() > minZoom + 0.05) map.panTo(target, { animate: !reduceMotion, duration: 0.6 });
    return;
  }
  if (reduceMotion) { map.setView(target, Math.max(map.getZoom(), minZoom + 1.3), { animate: false }); return; }
  // ease in once at the start of the tour, then simply pan from stop to stop
  if (map.getZoom() < minZoom + 1.2) map.flyTo(target, minZoom + 1.3, { duration: animate ? 1.1 : 0.6 });
  else map.panTo(target, { animate: true, duration: 0.8 });
}

function animateHead() {
  // _path is Leaflet internal, but L.Path exposes no accessor and we need the SVG length
  const path = routeHead._path;
  if (!path) return;
  const len = path.getTotalLength();
  path.style.setProperty("--len", len);
  path.style.strokeDasharray = `${len} ${len}`;
  path.classList.remove("draw");
  void path.getBoundingClientRect();
  path.classList.add("draw");
}

function drawLabel(e) {
  const el = labelMarker.getElement();
  if (!el) return;
  // below 520px the label would span the sheet, and the panel underneath already names the stop
  if (!e.ll || map.getSize().x < 520) { el.style.display = "none"; return; }
  el.style.display = "";
  el.textContent = e.t + " ";
  const yr = document.createElement("span");
  yr.className = "yr";
  yr.textContent = e.y;
  el.append(yr);
  labelMarker.setLatLng(toLatLng(e.ll));
  const x = map.latLngToContainerPoint(toLatLng(e.ll)).x;
  el.classList.toggle("left", x + el.offsetWidth + 30 > map.getSize().x);
}

export const onMapMove = (fn) => { map.on("move zoom moveend zoomend resize", fn); fn(); };
