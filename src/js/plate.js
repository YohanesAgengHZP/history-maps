// Plate furniture drawn over the map and fixed to the sheet: paper margin, double neatline,
// graticule figures in the band, compass rose, and the cartouche that carries the legend.
import { map, onMapMove } from "./map.js";
import { TIERS } from "./vocab.js";

const NS = "http://www.w3.org/2000/svg";
const el = (name, attrs = {}) => {
  const n = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
};

export const KEYS = [
  { k: "victory", l: "Victory" },
  { k: "defeat", l: "Defeat" },
  { k: "draw", l: "Indecisive" },
  { k: "milestone", l: "Turning point" },
  { k: "route", l: "Order of travel" },
  { sub: "Forces engaged" },
  ...TIERS.map((t, i) => ({ size: i, l: t.l }))
];

const MARGIN = 22;       // width of the band that carries the graticule figures
const INSET = 28;        // inner neatline, measured in from the sheet edge

export function initPlate(svg) {
  const mask = el("path", { class: "plate-mask", "fill-rule": "evenodd" });
  const outer = el("rect", { class: "neatline outer" });
  const inner = el("rect", { class: "neatline inner" });
  const ticks = el("g");
  const rose = el("g", { class: "rose" });
  rose.append(
    el("path", { d: "M0,-24L5.5,-5.5L24,0L5.5,5.5L0,24L-5.5,5.5L-24,0L-5.5,-5.5Z" }),
    el("path", { class: "needle", d: "M0,-24L5.5,-5.5L-5.5,-5.5Z" })
  );
  const roseN = el("text", { y: -30 });
  roseN.textContent = "N";
  rose.append(roseN);

  const cart = el("g", { class: "cartouche" });
  const box = el("rect", { class: "box" });
  const head = el("text", { class: "head" });
  head.textContent = "EXPLANATION";
  const headRule = el("line", { class: "rule" });
  cart.append(box, head, headRule);

  const rows = KEYS.map((d) => {
    const g = el("g");
    if (d.sub) {
      const t = el("text", { class: "subhead" });
      t.textContent = d.sub;
      g.append(t);
    } else {
      if (d.size !== undefined) g.append(el("circle", { class: "key-size", fill: "var(--muted)" }));
      else if (d.k === "route") g.append(el("line", { class: "key-route" }));
      else if (d.k === "milestone") g.append(el("path", { fill: "var(--milestone)", d: "M0,-4.2L4.2,0L0,4.2L-4.2,0Z" }));
      else g.append(el("circle", { r: 3.6, fill: `var(--${d.k})` }));
      const t = el("text", { class: "row" });
      t.textContent = d.l;
      g.append(t);
    }
    cart.append(g);
    return g;
  });

  const scalebar = el("g", { class: "scalebar" });
  const sRule = el("line"), sL = el("line"), sR = el("line"), sText = el("text");
  scalebar.append(sRule, sL, sR, sText);
  cart.append(scalebar);

  svg.append(mask, outer, inner, ticks, rose, cart);

  function draw() {
    const { x: W, y: H } = map.getSize();
    // the observer can fire mid-layout with a collapsed container; a neatline needs room
    // for both margins plus something between them, or the rects come out negative
    if (W < 2 * INSET + 60 || H < 2 * INSET + 60) return;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const IN = { x0: INSET, y0: INSET, x1: W - INSET, y1: H - INSET };

    mask.setAttribute("d",
      `M${-W},${-H}H${W * 2}V${H * 2}H${-W}Z M${IN.x0},${IN.y0}H${IN.x1}V${IN.y1}H${IN.x0}Z`);
    const o = INSET - MARGIN;
    outer.setAttribute("x", o); outer.setAttribute("y", o);
    outer.setAttribute("width", W - 2 * o); outer.setAttribute("height", H - 2 * o);
    inner.setAttribute("x", IN.x0); inner.setAttribute("y", IN.y0);
    inner.setAttribute("width", IN.x1 - IN.x0); inner.setAttribute("height", IN.y1 - IN.y0);

    drawTicks(ticks, IN, W);
    rose.setAttribute("transform", `translate(${IN.x1 - 42},${IN.y0 + 42}) scale(0.85)`);
    drawCartouche({ box, head, headRule, rows, scalebar, sRule, sL, sR, sText }, IN);
  }

  onMapMove(draw);
  new ResizeObserver(draw).observe(svg.parentElement);
}

// walk one edge of the neatline and record every graticule line that crosses it
function edgeCrossings(ax, ay, bx, by, pick, step) {
  const out = [];
  const N = 120;
  let prev = null;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const ll = map.containerPointToLatLng([ax + t * (bx - ax), ay + t * (by - ay)]);
    const cur = ll && isFinite(pick(ll)) ? { v: pick(ll), x: ax + t * (bx - ax), y: ay + t * (by - ay) } : null;
    if (prev && cur && cur.v !== prev.v) {
      const lo = Math.min(prev.v, cur.v), hi = Math.max(prev.v, cur.v);
      for (let m = Math.ceil(lo / step) * step; m <= hi; m += step) {
        const f = (m - prev.v) / (cur.v - prev.v);
        out.push({ v: m, x: prev.x + f * (cur.x - prev.x), y: prev.y + f * (cur.y - prev.y) });
      }
    }
    prev = cur;
  }
  return out;
}

function drawTicks(g, IN, W) {
  // the graticule is drawn every 5 degrees; on a phone label every other one so the figures stay legible
  const step = W < 520 ? 10 : 5;
  const pad = MARGIN / 2;
  const lon = (v) => `${Math.abs(v)}${v === 0 ? "" : v < 0 ? "W" : "E"}`;
  const lat = (v) => `${Math.abs(v)}${v < 0 ? "S" : "N"}`;
  const lngOf = (ll) => ll.lng, latOf = (ll) => ll.lat;
  const data = [
    ...edgeCrossings(IN.x0, IN.y0, IN.x1, IN.y0, lngOf, step).map((d) => ({ x: d.x, y: IN.y0 - pad, t: lon(d.v) })),
    ...edgeCrossings(IN.x0, IN.y1, IN.x1, IN.y1, lngOf, step).map((d) => ({ x: d.x, y: IN.y1 + pad, t: lon(d.v) })),
    ...edgeCrossings(IN.x0, IN.y0, IN.x0, IN.y1, latOf, step).map((d) => ({ x: IN.x0 - pad, y: d.y, t: lat(d.v) })),
    ...edgeCrossings(IN.x1, IN.y0, IN.x1, IN.y1, latOf, step).map((d) => ({ x: IN.x1 + pad, y: d.y, t: lat(d.v) }))
  ];
  g.textContent = "";
  for (const d of data) {
    const t = el("text", { class: "edge-tick", x: d.x.toFixed(1), y: d.y.toFixed(1) });
    t.textContent = d.t;
    g.append(t);
  }
}

function drawCartouche(parts, IN) {
  const { box, head, headRule, rows, scalebar, sRule, sL, sR, sText } = parts;
  // measure a bar across the middle of the sheet and round it to a readable distance
  const cy = (IN.y0 + IN.y1) / 2, mid = (IN.x0 + IN.x1) / 2;
  const a = map.containerPointToLatLng([mid - 65, cy]);
  const b = map.containerPointToLatLng([mid + 65, cy]);
  const km = map.distance(a, b) / 1000;
  if (!isFinite(km) || km <= 0) return;
  const pow = Math.pow(10, Math.floor(Math.log10(km))), m = km / pow;
  const nice = (m >= 5 ? 5 : m >= 2 ? 2 : 1) * pow;
  const len = 130 * nice / km;

  const padX = 11, rowH = 15;
  const bw = Math.max(142, len + 2 * padX), bh = 34 + rows.length * rowH + 26;
  const bx = IN.x1 - 12 - bw, by = IN.y1 - 12 - bh;
  box.setAttribute("x", bx); box.setAttribute("y", by);
  box.setAttribute("width", bw); box.setAttribute("height", bh);
  head.setAttribute("x", bx + bw / 2); head.setAttribute("y", by + 15);
  headRule.setAttribute("x1", bx + padX); headRule.setAttribute("x2", bx + bw - padX);
  headRule.setAttribute("y1", by + 22); headRule.setAttribute("y2", by + 22);

  rows.forEach((g, i) => {
    g.setAttribute("transform", `translate(${bx + padX + 5},${by + 34 + i * rowH})`);
    const size = g.querySelector(".key-size");
    if (size) size.setAttribute("r", (TIERS[KEYS[i].size].r * 0.62).toFixed(2));
    const route = g.querySelector(".key-route");
    if (route) { route.setAttribute("x1", -5); route.setAttribute("x2", 5); }
    const row = g.querySelector(".row");
    if (row) row.setAttribute("x", 12);
    const sub = g.querySelector(".subhead");
    if (sub) { sub.setAttribute("x", -5); sub.setAttribute("y", 2); }
  });

  scalebar.setAttribute("transform", `translate(${bx + (bw - len) / 2},${by + bh - 11})`);
  sRule.setAttribute("x2", len);
  sL.setAttribute("y2", 4);
  sR.setAttribute("x1", len); sR.setAttribute("x2", len); sR.setAttribute("y2", 4);
  sText.setAttribute("x", len / 2); sText.setAttribute("y", -6);
  sText.textContent = `${nice >= 1 ? Math.round(nice) : nice} km`;
}
