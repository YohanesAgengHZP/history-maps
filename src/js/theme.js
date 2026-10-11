// Manual light/dark override. base.css already carried [data-theme] rules; until now
// nothing ever set the attribute, so the page could only follow the system setting.
import { store } from "./storage.js";

const KEY = "eaglesroad.theme";
const ORDER = ["auto", "light", "dark"];
const $ = (id) => document.getElementById(id);

export function initTheme() {
  apply(store.get(KEY) || "auto");

  const btn = $("theme");
  if (!btn) return;
  btn.onclick = () => {
    const now = store.get(KEY) || "auto";
    apply(ORDER[(ORDER.indexOf(now) + 1) % ORDER.length]);
  };
}

function apply(mode) {
  store.set(KEY, mode);
  if (mode === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", mode);

  const btn = $("theme");
  if (!btn) return;
  const label = { auto: "Theme: follows your system", light: "Theme: light", dark: "Theme: dark" }[mode];
  btn.title = label;
  btn.setAttribute("aria-label", label);
  for (const m of ORDER) {
    const icon = $("theme-" + m);
    if (icon) icon.style.display = m === mode ? "" : "none";
  }
}
