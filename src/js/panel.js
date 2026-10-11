// The info panel for the selected stop, plus the St Helena inset button.
import { events, state, campaigns, subscribe, select, step, positionInView, isVisible } from "./store.js";
import { OUTCOME, ROLE, KIND, fmtLL, fmtMen } from "./vocab.js";

const $ = (id) => document.getElementById(id);
const insetIndex = events.findIndex((e) => e.inset);

export function initPanel() {
  $("prev").onclick = () => step(-1);
  $("next").onclick = () => step(1);
  $("inset").onclick = () => select(insetIndex);

  // page-wide arrow keys. The track handles its own and stops propagation, so a key
  // press with a tick focused does not step twice.
  document.addEventListener("keydown", (ev) => {
    if (ev.target.closest?.("input,textarea,select")) return;
    if (ev.key === "ArrowRight") { step(1); ev.preventDefault(); }
    if (ev.key === "ArrowLeft") { step(-1); ev.preventDefault(); }
  });

  subscribe(render);
  render();
}

function render() {
  const e = events[state.current];
  const at = positionInView();

  $("step").textContent = at === -1
    ? `${state.current + 1} of ${events.length}, outside the filter`
    : `${at + 1} of ${state.view.length}`;
  $("year").textContent = e.y;
  $("title").textContent = e.t;
  $("where").textContent = `${e.d}. ${e.w}`;

  const cll = e.ll || e.cll;
  $("coords").hidden = !cll;
  if (cll) $("coords").textContent = fmtLL(cll);

  const badge = $("badge");
  badge.className = "badge o-" + e.o;
  badge.textContent = "";
  badge.append(document.createElement("i"), OUTCOME[e.o]);
  if (e.naval) {
    const s = document.createElement("small");
    s.textContent = "naval battle";
    badge.append(s);
  }

  $("role").hidden = !e.np;
  if (e.np) $("role").textContent = ROLE[e.np];
  $("desc").textContent = e.desc;
  $("dispute").hidden = !e.dispute;
  if (e.dispute) $("dispute").textContent = e.dispute;
  $("fact").textContent = e.fact;

  dossier(e);

  $("prev").disabled = at <= 0;
  $("next").disabled = at === -1 || at >= state.view.length - 1;

  const inset = $("inset");
  inset.classList.toggle("current", !!e.inset);
  inset.classList.toggle("visited", state.current >= insetIndex);
  inset.classList.toggle("off", !isVisible(insetIndex));
}

function dossier(e) {
  const dl = $("dossierBody");
  dl.textContent = "";
  const row = (term, build) => {
    const dt = document.createElement("dt");
    dt.textContent = term;
    const dd = document.createElement("dd");
    build(dd);
    dl.append(dt, dd);
  };
  const list = (items, cls) => (dd) => {
    const ul = document.createElement("ul");
    for (const x of items) {
      const li = document.createElement("li");
      if (cls) li.className = cls;
      li.textContent = x;
      ul.append(li);
    }
    dd.append(ul);
  };

  if (KIND[e.kind]) row("Type", (dd) => (dd.textContent = KIND[e.kind]));
  const camp = campaigns.find((c) => c.id === e.camp);
  if (camp) row("Campaign", (dd) => (dd.textContent = camp.name));
  if (e.coal) row("Conflict", (dd) => (dd.textContent = e.coal));
  if (e.men) row("Forces engaged", (dd) => (dd.textContent = `about ${fmtMen(e.men)}, both sides`));
  if (e.cmd) row("Commanders", list(e.cmd));
  if (e.src) row("Sources", list(e.src, "cite"));
}
