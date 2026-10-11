# The Eagle's Road: Napoleon campaign map

An interactive map of Napoleon Bonaparte's life and campaigns, from his birth in Ajaccio (1769) to his death on St Helena (1821). It was built as a personal gift for a friend who loves history (Renaissance, Tudors, Napoleon). The tone should stay friendly, curious, and accurate, not romantic.

The map is dressed as an engraved atlas plate. The reference is `sample/image.png`: a W. & A.K. Johnston steel-engraved plate for Blackwood's, "Map of North Italy, Switzerland, South Germany etc, to Illustrate the Campaigns of 1796". It is **Victorian, not Renaissance** — which is why it is a fair model here: a near-contemporary military atlas of this exact subject.

## Layout

```
src/
  index.html
  styles/   base.css    tokens, typography, page chrome
            map.css     the plate, Leaflet overrides, markers, furniture
            panel.css   the info panel and dossier
            timeline.css  filters, phase track, legend
  js/       main.js     bootstrap and the data self-check
            store.js    selection, filters, journey state, subscriptions
            journey.js  the guided tour
            layers.js   the historical frontiers control
            archive.js  the archive drawer
            reflection.js  the turning-point reflections
            intro.js    the opening card and closing chapter
            letters.js  letters to Joséphine, per stop
            theme.js    the light / dark / auto toggle
            audio.js    the optional music box
            map.js      Leaflet, the conic CRS, all geography
            plate.js    neatline, graticule figures, compass, cartouche
            panel.js    the info panel
            timeline.js the phase track and Play
            filters.js  the three filters and the legend fallback
            vocab.js    display vocabulary and symbol rules
  data/     events.json      the 39 stops
            campaigns.json   phases and campaigns
            vocabulary.json  outcome / role / kind labels, size tiers
            land.json        coastline GeoJSON
            hachures.json    terrain strokes
            seas.json        sea labels
            boundaries-1800.json, boundaries-1815.json  historical frontiers
            archive.json     catalogue records per stop
            reflections.json four turning-point essays
            anthem.json      La Marseillaise melody, CC0
            letters.json     five letters to Joséphine, Hall 1901
            sources.json     provenance, licensing and known gaps
tools/      hachures.py          one-shot terrain generator
            extract-data.mjs     one-shot migration from the old single file
            research-archive.py  queries the Commons API for candidate plans
            curate-archive.py    turns those results into src/data/archive.json
            extract-letters.py   slices letters out of the Gutenberg edition
legacy/     napoleon-map-d3.html   the previous single-file d3 version, superseded
```

## Running it

```bash
npm install
npm run dev       # vite dev server
npm run build     # -> dist/index.html
```

`npm run build` inlines every script, style and JSON import into **one** `dist/index.html`. That preserves the property the project was born with: a single file you can email, open by double-clicking, and host anywhere. Nothing is fetched at runtime except the Google Fonts stylesheet — no tiles, no images, no data files.

`legacy/napoleon-map-d3.html` is the pre-Leaflet version, kept only so nothing is lost. It is not maintained and can be deleted once you are happy with the rebuild.

## Tech

- **Leaflet 1.9** for pan and zoom, **proj4** for the projection. No framework, no backend.
- Leaflet is Web Mercator by default; the plate needs Lambert conformal conic, so `map.js` defines a custom `L.CRS` on top of proj4. Nothing else in Leaflet assumes Mercator, but **if you change the CRS, the graticule figures and the scale bar both break**, because they invert screen coordinates back through it.
- **Google Fonts:** Bodoni Moda for display text (a Didone; Didot printed for Napoleon's court), Figtree for UI and body text, JetBrains Mono (`--mono`) as the data voice — the step counter, the coordinate readout, the phase year ranges, the filter labels and count, and the scale bar. Numbers that are data are set in mono; numbers that are editorial (the big year) stay in Bodoni.
- **Map data:** Natural Earth land (`world-atlas@2`, `land-10m.json`), clipped and simplified with mapshaper. Coastlines only, no modern country borders, to avoid anachronism.

### How the land data was generated

```bash
npm i world-atlas@2 mapshaper@0.6
npx mapshaper node_modules/world-atlas/land-10m.json \
  -clip bbox=-30,12,62,72 -simplify 16% keep-shapes \
  -filter-islands min-area=60km2 \
  -o format=geojson precision=0.01 src/data/land.json
```

mapshaper winds its rings the opposite way to d3. The old d3 version flipped them at runtime; Leaflet fills with `fill-rule: evenodd` and does not care, so the data is stored as mapshaper leaves it.

### How the hachures were generated

Terrain relief comes from real elevation, never from invented shapes. `tools/hachures.py` reads a 0.1° ETOPO grid for the map's bounding box (fetched from the NOAA CoastWatch ERDDAP service — the command is in the script's docstring), smooths it, computes slope and aspect, and emits one short downhill stroke per sampled cell above 150 m.

The result is `src/data/hachures.json`: `xy` (four little-endian int16 per stroke, start and end lon/lat in hundredths of a degree) and `w` (one slope class 0–2 per stroke). About 7,900 strokes, ~93KB. **Stored in degrees, not pixels**, so they are projected at load and survive a change of projection.

Re-run the script if you want different density or weight. Nothing fetches elevation at runtime.

## Code structure

Nothing reaches into another module's DOM. Views subscribe to the store and re-render; the store is the only thing that knows which stop is selected.

### `src/js/store.js` — the single source of truth

Holds `state.current` (selected index), `state.view` (indices the filters allow) and `state.filters`. Exports `select()`, `setFilters()`, `step()` and `subscribe()`. Everything downstream navigates `view`, not raw indices:

- `step(dir)` moves one *filtered* stop at a time; prev/next, arrow keys and Play all go through it.
- `visibleEvents()` / `travelledEvents()` derive the route from `view`, so filtering to one campaign draws only that campaign's path.
- An empty filter combination is allowed: it keeps the current stop on screen, the panel labels it "outside the filter", and both nav buttons disable.

### `src/js/journey.js` — the guided tour

Owns the interval; `state.journey` lives in the store so `map.js` can read it without the two importing each other. Rules that matter:

- **A manual move pauses the tour, it never ends it.** Clicking a marker, a tick, prev/next or an arrow key while the tour runs pauses it in place; Resume carries on from the new stop. This is why `select()` carries a `fromJourney` flag — without it the tour would tear itself down on its own advances.
- The main Play button is the play/pause/resume control. The bar below the track carries Previous, Next and Exit. Exit returns the map to the home view.
- Reaching the last stop ends the tour but leaves you on that stop rather than snapping away.

### `src/data/events.json` — the 39 stops, in chronological order

```js
{
  p: "empire",            // phase id, must exist in campaigns.json
  y: "1805",              // year shown in the panel (a string, the YEAR)
  d: "2 December 1805",   // full date text, for display only
  t: "Battle of Austerlitz",
  kind: "battle",         // battle | siege | campaign | political | personal.
                          // Drives the timeline tick shape and the dossier Type row
  camp: "ga",             // campaign id, must exist in campaigns.json
  coal: "War of the Third Coalition",  // optional; the wider conflict
  np: "commanded",        // optional; commanded | present | absent. Omit for non-battles
  men: 153000,            // optional; approximate combined strength engaged, both sides.
                          // Drives the marker size tier. Omit for milestones and for the
                          // two campaign entries (Ulm, Into Spain), where one figure is meaningless
  cmd: ["France: ...", "Russia and Austria: ..."],  // optional; one string per side
  src: ["Chandler, ...", "..."],       // required; the works this entry leans on
  dispute: "...",         // optional; why the outcome is contested. Renders as "Disputed. ..."
  w: "Slavkov u Brna, Moravia",  // place, modern name
  ll: [16.76, 49.13],     // [lon, lat]; null for off-map (St Helena)
  cll: [-5.71, -15.96],   // optional; [lon, lat] for the panel coordinate readout only,
                          // used when ll is null so the off-map stop still shows coordinates
  o: "victory",           // victory | defeat | draw | milestone
  nudge: [dx, dy],        // optional; pixel offset applied to the marker's icon anchor
  naval: true,            // optional; badge adds "naval battle"
  inset: true,            // optional; the stop lives in the St Helena inset, not on the map
  desc: "...",            // 1-3 sentence description
  fact: "..."             // "Did you know?" fact
}
```

Note `y` is the **year**, not a coordinate. The old d3 version stored projected pixels on the same objects and the `y` clash caused a bug; Leaflet projects on the fly, so nothing is cached on an event any more.

### `src/js/layers.js` + the frontiers data — historical territory

Two snapshots only, **1800** and **1815**, because those are the only years in the source dataset that fall inside this atlas's span. There is no verified snapshot for 1805, 1812 or 1813, and **nothing is interpolated between them** — offering a "closest year" would invent a political map that never existed.

- Source: [Historical Basemaps](https://github.com/aourednik/historical-basemaps) by André Ourednik and contributors, GPL-3.0. Its maintainers call it work in progress and ask that it be checked against other sources before academic use, so the control says the outlines are approximate and `sources.json` carries the full caveat.
- **GPL-3.0 is copyleft.** Bundling this data into the build arguably places the distribution under GPL terms. Fine for a personal gift; worth a decision before publishing more widely.
- Features whose `SUBJECTO` differs from `NAME` are drawn with a faint wash — that is the dataset's own way of saying "under another power's authority", and it is what distinguishes a dependency from a sovereign state.
- `BORDERPRECISION < 3` draws a dashed outline. **In this window every feature is precision 3**, so that rule never currently fires; it is kept because it is data-driven and will light up if the dataset improves.
- Boundaries live in their own Leaflet pane at `z-index 405`: above the land fill, below the markers. They are stroked in `--ink`, not `--imperial`, so they never read as part of the route.
- Switching years must not disturb the selected stop, the zoom or the timeline.

### `src/js/archive.js` + `archive.json` — the archive drawer

Catalogue records for twelve items across ten stops, discovered through the Wikimedia Commons API and filtered to public domain or CC0 only. **Every field is copied from a catalogue record; none of it is written from memory.** Regenerate with `tools/research-archive.py` then `tools/curate-archive.py`.

- **No images are embedded.** Entries link to the holding institution's record, or to the verified Commons record. That keeps the page self-contained and avoids stretching anyone's reuse terms.
- Items are labelled **contemporary** or **later depiction**, decided from evidence in the record itself: a date well after the battle, or an engraver who was still a child at the time. Burdet was born in 1798, so his Berezina print is not a 1812 eyewitness document.
- Link text names what the link actually is — a Wikidata item is not a museum catalogue, and a handle is a persistent identifier.
- For an engagement with nothing sourced, the drawer stays visible and says so. Absence of evidence is worth stating; for a non-battle there is nothing to explain and the drawer hides.

### `src/js/reflection.js` + `reflections.json` — turning points

Four stops carry a reflection: Austerlitz, Moscow, Leipzig and Waterloo. Each one is split into **`established`** and **`interpretation`**, and the two must never be merged into one list — the whole point of the panel is that a reader can see which is which. Squared bullets and a solid accent rule mark the record; open bullets and a plain rule mark the argument.

Rules for writing one: a statement belongs in `established` only if it is a date, an order of battle, a treaty or an event. Anything with "most historians", "it is argued" or a causal claim belongs in `interpretation`, and should name who argues it where that is known. No scoring, no verdicts, no "what if".

### `src/js/intro.js` — the opening card and the closing chapter

Both are overlays on the plate, not routes, so the map underneath keeps its state.

- The opening card is gated on `sessionStorage`, not `localStorage`: it greets her on a fresh visit but does not reappear on every reload while she is reading.
- The closing chapter fires when the **journey ends on the last stop**, not merely when someone clicks the St Helena marker. `intro.js` watches for the `journey` event going from active to inactive while `state.current` is the final index.
- Both trap Tab, close on Escape, and return focus to whatever opened them.
- **The dedication lives in `index.html`**, in the `#outro` card and the footer. Those lines are the personal ones — they are meant to be edited, and nothing generates or infers them.

### `src/js/audio.js` — the optional music box, and the rule about music

**Off by default, never autoplays, and there is not a single audio file in the project.** The tune is synthesised with the Web Audio API from `anthem.json`, which holds 210 notes (3.5KB) extracted from a CC0 MIDI of *La Marseillaise* on Wikimedia Commons — melody attributed there to Strasbourg, 1792. It is rendered as a music box because that is also period: the mechanism was devised by the Geneva watchmaker Antoine Favre in 1796.

Synthesis rather than a recording is a licensing decision, not a technical one. **An old composition being public domain does not make a modern recording of it public domain** — the recording carries its own separate copyright. Synthesising from a CC0 score avoids that entirely, and keeps the page a single self-contained file.

Notes are scheduled ~2.5s ahead of the audio clock rather than fired from `setInterval`, because timer drift is audible immediately. The `AudioContext` is created inside the click handler, since browsers refuse to start one without a gesture.

**If you are asked to add a specific modern song: you cannot.** A commercial release is all rights reserved by default, and crediting the artist is not a licence — attribution says who made it, a licence says you may use it. This also applies to synthesising the melody yourself, because the melody *is* the protected composition. The supported pattern is the `.listening` line in the footer: a plain link to the track at its official source. Linking is not copying.

### `src/js/letters.js` + `letters.json` — his own words

Five letters to Joséphine, each attached to the stop it was written from or about: Arcole (the Marmirolo letter of 17 July 1796), Austerlitz, Jena, Eylau and Friedland. Three of them were written within two days of the battle, which is the reason for including them — they are the man at the moment, not the memoir written afterwards.

**The text is sliced out of the source file by `tools/extract-letters.py`, never retyped.** The source is Henry Foljambe Hall's 1901 translation, Project Gutenberg ebook 37499; the letters and that translation are both long out of copyright. The only alteration is typographic: Gutenberg writes em dashes as two hyphens. Spellings stay as Hall printed them.

This matters more than it sounds. The widely copied blog version of the Marmirolo letter contains at least three corruptions — "I urge **your** strongly", "do **your** good", "proves **who** false" — where the edition reads "you strongly", "do you good", "proves how false". Anything that circulates this much drifts.

**Napoleon is among the most misquoted figures in history**; "Not tonight, Josephine" is entirely apocryphal. If you add to this file, take the words from a scholarly edition and record which one. Do not take them from a quotations site.

### `src/js/theme.js` — light / dark / auto

`base.css` carried `[data-theme]` rules from the start but nothing ever set the attribute, so until Phase 4 the page could only follow the system. The button cycles auto → light → dark and stores the choice. `auto` removes the attribute rather than setting a value, which is what lets the `prefers-color-scheme` block take over again. `initTheme()` runs before `initMap()` so the page never flashes the wrong palette.

### `src/js/vocab.js` — display vocabulary and symbol rules

`OUTCOME`, `ROLE`, `TIERS`, plus `tierOf()` / `radius()` (marker size from `men`), `fmtMen`, `fmtLL`, and `toLatLng`.

**`toLatLng` is load-bearing.** Leaflet takes `[lat, lon]`; the historical data is stored `[lon, lat]`. Every crossing of that boundary goes through this one helper, because getting it backwards silently puts Paris in the Indian Ocean.

### `src/js/map.js` — Leaflet and the geography

- **CRS.** Leaflet is Web Mercator by default, which would be the wrong shape for this sheet. `PlateCRS` is a custom `L.CRS` built on proj4 with `+proj=lcc +lat_1=35 +lat_2=58 +lon_0=14` — the same Lambert conformal conic the plate was designed around. `scale(z) = 2^z / 10000` means zoom 0 is 10 km per pixel; `OFFSET` shifts projected metres positive so Leaflet's pixel origin behaves.
- **Layers, bottom to top:** graticule, five water-lining outlines, land, three hachure paths, sea labels, `route-full` (dashed, the stops currently in view), `route-done`, `route-head`, markers, the selected label.
- **Water lining** is the engraver's trick from the reference plate: the same outline stroked five times, alternating `--coast` and `--sea` at shrinking widths, so the sea-coloured strokes cut the coast-coloured ones into concentric lines hugging every coast. The land fill then covers the inland half.
- **Hachures** are three `L.polyline`s, one per slope class, each given a nested array so Leaflet renders all ~7,900 strokes as a single SVG path rather than 7,900 layers. Stroke *width* is constant on screen; stroke *length* is geographic, so the relief magnifies with the map the way a printed engraving does. Tuned to read at the default zoom; zoomed in it coarsens, and that is accepted rather than fixed.
- **Markers are Leaflet `divIcon`s**, not SVG, so they stay a constant pixel size with no counter-scaling. Radii in `TIERS` are therefore plain CSS pixels.
- `fitBounds` uses every stop plus two corner anchors, because no stop sits in the Atlantic or the Maghreb but the sheet should still reach them. After fitting, `minZoom` is pinned to the fitted zoom and `maxZoom` to `+3`, reproducing the old 1×–8× range.
- **Wheel and pinch are handled by `attachWheelZoom()`, not by Leaflet.** `scrollWheelZoom` is off. Both gestures arrive as `wheel` events but are nothing alike: a trackpad pinch streams dozens of small deltas with `ctrlKey` set, a mouse wheel sends a few large notches. Leaflet applies one `wheelPxPerZoomLevel` to both, so any value tuned for one ruins the other — tuned for the wheel, the pinch leaps in visible steps. The handler reads `ctrlKey` and uses 1/110 per pixel for a pinch, 1/180 for a wheel, giving ~0.055 levels per pinch event and ~0.67 per notch.
  - It zooms with **`animate: false`** via `setZoomAround`. That is the part that makes a pinch feel continuous: an animated zoom per event queues up and produces the stepping.
  - `setZoomAround` keeps the point under the pointer fixed, so the map does not slide away from the cursor.
  - This plate has only 3 zoom levels where a tiled map has ~20, which is why none of Leaflet's defaults suit it. `bounceAtZoomLimits: false` stops the rubber-band at the ends, which over so short a range reads as a glitch.
  - If you change the zoom range, re-measure: dispatch `WheelEvent`s with `deltaY: -6, ctrlKey: true` (pinch) and `deltaY: -120` (wheel) and check the per-event step.
- **`moveCamera()` has two modes.** Outside the tour the map only recentres if the reader has already zoomed in — it must not yank the view while someone is reading a dossier. During the tour it eases in once to `minZoom + 1.3` and then pans from stop to stop. Reduced motion gets `setView` with no animation.
- `animateHead()` touches `routeHead._path`. That is a Leaflet internal, used because `L.Path` exposes no element accessor and the dash animation needs `getTotalLength()`.

### `src/js/plate.js` — the furniture drawn over the map

A plain SVG overlay, sized in CSS pixels, redrawn on every map move and on resize.

- `plate-mask` is one evenodd path filling everything outside the inner neatline with `--panel`, so map content never runs into the margin. This is why `.map-wrap` is `--panel` and not `--sea`.
- `edgeCrossings()` walks an edge of the neatline, converting container points back to lat/lng with `map.containerPointToLatLng()`, and interpolates where each graticule line crosses. Runs on all four edges, so the figures follow pan and zoom. Step is 5°, or 10° under 520px where every 5° is unreadable.
- `draw()` bails out if the container is smaller than the two margins plus some middle. The ResizeObserver can fire mid-layout with a collapsed element, and without the guard the neatline rects get negative widths.
- The cartouche is the legend, in two sections: outcome keys, then a `FORCES ENGAGED` subhead and the three size tiers. `KEYS` drives both it and the `.key-item` list items in the HTML legend — one array, two renderings, so they cannot drift. Entries are `{k, l}`, `{sub}` or `{size, l}`.
- The scale bar lives inside the cartouche. It measures a 130px bar across the middle of the sheet with `map.distance()`, rounds to 1/2/5 × 10ⁿ, and the cartouche sizes itself around the result.

### `src/js/panel.js`, `timeline.js`, `filters.js`

The info panel (including the role line, the disputed note and the dossier), the phase track, and the three filter `<select>`s. Below 620px CSS hides the cartouche and reveals the legend list instead.

**Timeline keyboard.** The ticks are a roving-tabindex group: only the selected tick has `tabIndex 0`, so the track is one tab stop rather than thirty-nine. Arrow keys step, Home/End jump to the ends, and focus follows the selection. The handler calls `stopPropagation()` because `panel.js` also listens for arrows on `document` — without it a key press with a tick focused would step twice.

**Tick shape says what kind of event it was; colour says how it ended.** `e.kind` is one of battle, siege, campaign, political, personal. These shapes exist only on the timeline — the map markers are still circle-or-diamond by outcome — so the cartouche does not explain them and the legend row under the track carries its own key, built from the same `KIND` vocabulary.

### `src/js/main.js`

Imports the stylesheets, initialises each view, wires the zoom buttons, stops Play on any manual navigation, and runs the data self-check. The check warns if a stop is missing a known campaign, sources, coordinates, a valid outcome or phase, if `men` is present but not positive, or if the years run backwards. Campaign entries without a `men` figure are reported with `console.info`, not a warning — Ulm and Into Spain are deliberate.

## Design tokens

Colors are CSS variables on `:root`, with dark-mode overrides under `prefers-color-scheme: dark` and `[data-theme="dark"]`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | #E6EAE8 | #0E1820 | page background |
| `--sea` | #D2DCDA | #122330 | sea |
| `--land` | #F4F6F5 | #213139 | land |
| `--ink` | #1B2433 | #ECE8DD | text |
| `--imperial` | #24346F | #A5B6F2 | route, turning points |
| `--victory` | #93690F | #E3B852 | victories (gold) |
| `--defeat` | #9B2C2C | #EE7A6E | defeats (crimson) |
| `--draw` | #5F6673 | #AAB0BA | indecisive |

Shapes encode type: circles mark battles and diamonds mark turning points. Future (unvisited) events are drawn at 42% opacity.

House rules (see `instruction/design.md`): the surfaces are a cool monochrome paper, never warm cream or beige. `--imperial` is the one accent; the four outcome colours are data encoding, not decoration. Separation comes from 1px rules and whitespace, so there are no box-shadows anywhere, no gradients, and no rounded pills. Icons are inline SVG with `stroke: var(--ink)`, never emoji or Unicode glyphs.

The historical register is engraved atlas, not parchment: the water lining, the hachures, the compass rose, the scale bar and the italic Didone sea labels carry it. No paper textures, no aging filters, no ornamental frames, no wax seals. Bodoni Moda is a Didone, the class Didot cut and printed for Napoleon's court — that is a stylistic lineage, **not** a claim that this font is an authentic period face, and nothing in the UI should claim otherwise.

The map is dressed as an engraved atlas plate, after `sample/image.png`: paper margin, double neatline, graticule figures in the band, water-lined coasts, compass rose, ruled cartouche. Relief is drawn as hachures from real elevation, and the plate's ranked-symbol convention is used for battle size. What was deliberately **not** copied: hand-coloured boundary washes, which need historical frontier data (see the ideas list). The palette stayed cool; the plate look comes from line work, not from an aged-paper tint.

Layout: on desktop, the map sits on the left with a 300–380px info panel on the right, a filter row and the timeline bar below. At 900px and under, everything stacks into one column. `.plate` wraps the Leaflet container, the frame overlay and the controls with `aspect-ratio: 1000/720`, so the zoom buttons and the St Helena inset stay inside the neatline even when the info panel makes the column taller than the map. On the plate, the zoom buttons are top-left, the compass rose top-right, the St Helena inset bottom-left and the cartouche bottom-right.

The panel runs: step counter, year, title, place, coordinates, outcome badge, who commanded, description, disputed note, "Did you know?", and a collapsed `<details class="dossier">` holding campaign, conflict, commanders and sources. Secondary detail goes in the dossier so the first glance stays short.

## Content rules

- Every fact must be historically accurate. Paraphrase rather than quote, and mark legends as legends ("said to", "reportedly").
- Army sizes and casualties are approximate. The footer already says so.
- **Never imply Napoleon fought everything.** Every battle carries `np`, and the panel says so in plain words. The Nile, Trafalgar, Bailén, Salamanca and Quatre-Bras are all in the atlas precisely because he was not there.
- **Sources are named, never invented.** `src` holds real works and institutions (Chandler, Esdaile, Lieven, Muir, Roberts, Zamoyski, the Fondation Napoléon, The Napoleon Series, Britannica, the National Maritime Museum). Do not add deep URLs that have not been checked; a named work beats a guessed link.
- **The route is illustrative.** It joins the stops in order with straight lines and is not a marching route. The legend says so, and it must keep saying so.
- Where an outcome is genuinely contested (Eylau, Borodino, the Berezina), use `dispute` rather than picking a side quietly.
- **Marker size means scale, not importance.** `men` is approximate combined strength engaged, so the famous-but-small (Trafalgar, Lodi, Arcole) stay small dots. Resist the urge to inflate a figure to make a celebrated battle look bigger — fame belongs in `desc` and `fact`, not in the symbol. If you add or change a `men` value, check it against the stop's own `fact` text so the panel does not contradict itself; Leipzig is set to 600,000 to match the figure its fact already quotes.
- The footer gift line (`class="gift"`) invites her to point out mistakes. Keep that spirit.

## Testing

A cheap static pass first, which catches what a successful build does not — the build proves imports resolve, not that an element id exists. Cross-check every `getElementById` / `$("…")` in `src/js` against the ids in `index.html`, confirm each data file parses, and confirm every key in `archive.json` and `reflections.json` matches a stop title in `events.json`. A renamed stop silently empties both drawers otherwise.

Then a headless pass with Playwright against `npm run dev`. A clean console means the data self-check passed (the one `console.info` about Ulm and Into Spain is expected). Then: click `#next` through all 39 stops and confirm it ends disabled, exercise the three filters plus `#fclear` including an empty combination, open the dossier, zoom in and confirm the scale bar re-reads and the graticule figures recompute, and screenshot in light, dark and a 390px viewport.

**Take a full-page screenshot as part of this.** The viewport resize it performs is what exposed the collapsed-container bug in `plate.js`; a normal element screenshot does not.

In dev, `window.__map` is the Leaflet instance, so checks can drive it directly:

```js
const m = window.__map;
m.setZoom(m.getZoom() + 2);
document.querySelector('.scalebar text').textContent;   // should change
document.querySelectorAll('.edge-tick').length;          // should recompute
```

For the frontiers layer, check that switching years really swaps the data — count `.bdy.dependent`, which is 11 for 1800 and 5 for 1815, since the total polygon count is clipped to the viewport and looks identical either way. Also confirm Off clears, and that selection, zoom and timeline survive a switch.

**Before shipping a new archival entry, check its links resolve.** Several institutions block scripted requests, so a plain `curl` is not proof either way: the British Museum and Gallica return 403 to curl but load fine in a browser, `hdl.handle.net` returns 405 to HEAD but 200 to GET, and RMG's `collections.rmg.co.uk` URLs redirect to a canonical `www.rmg.co.uk` form. Verify in a browser before concluding a link is dead.

For the guided journey, check all of: it eases the camera in on start (not only on the first advance), a manual click or arrow key **pauses rather than exits**, Resume carries on from the new stop, Exit returns the map home and clears the dimming, and under reduced motion the camera jumps instead of flying.

Finally, **test the build, not just the dev server** — `npm run build` then serve `dist/`. The dev server resolves modules differently, and `dist/index.html` is what actually gets sent to anyone. Confirm it contains no `src=` attributes and no external `href` beyond Google Fonts.

### Marker spacing

Several stops share a spot — three around Paris, three around Waterloo, Dresden and Leipzig, Montenotte and Golfe-Juan. `e.nudge` is a pixel offset applied to the **icon anchor**, so the symbol moves but the coordinate does not: the route and the coordinate readout stay on the true location.

Re-check spacing after changing a `men` value (radii come from `men`), after changing the marker tiers, and after changing `homeBounds` — widening the bounds zooms out, which pulls every cluster tighter. Paste into the console:

```js
(() => {
  const pts = [...document.querySelectorAll('.mk')].map(el => {
    const r = el.getBoundingClientRect(), i = el.querySelector('i').getBoundingClientRect();
    return { t: el.title, x: r.left + r.width / 2, y: r.top + r.height / 2, rad: i.width / 2 };
  });
  return pts.flatMap((a, n) => pts.slice(n + 1)
    .filter(b => Math.hypot(a.x - b.x, a.y - b.y) < a.rad + b.rad + 2)
    .map(b => `${a.t} ~ ${b.t}`));
})()
```

It should return an empty array. Nudging is iterative and easy to get backwards — pushing one marker clear usually shoves it into a third (Golfe-Juan went straight into Toulon). Measure after every change rather than reasoning about it.

## Relationship to `instruction/design.md`

`instruction/design.md` is the design brief this project is built against. Where it and this file disagree, **this file wins**: it records what was actually decided and why. Read both before changing the visual system.

The brief's recommended stack and structure — Vite, Leaflet, `src/js/*`, `src/styles/*`, `data/*.json` — **is now followed**. The project was a single d3 file until the rebuild; `legacy/napoleon-map-d3.html` is what it looked like before.

Still deliberately not followed, with reasons:

| Brief asks for | What we do instead | Why |
|---|---|---|
| Mobile bottom sheets / drawers | One-column stack under 900px | The stack already reads well on a phone; a drawer would hide the panel behind a tap for no gain. |
| Marker clustering, progressive marker visibility | Fixed markers with `nudge` offsets | 39 stops over Europe. Clustering solves a density problem we do not have. |
| Filter by year and by coalition | Filter by campaign, outcome and Napoleon's role | The timeline already is the year axis, and coalition partitions the data almost identically to campaign. Coalition is shown in the dossier instead. |
| A dedicated detail view per battle | The panel plus the collapsed dossier | Keeps the map on screen, which the brief also asks for. |
| ISO dates, machine-readable (`startDate`/`endDate`) | `y` (year string) and `d` (display date) | Nothing sorts or filters by date; order is the array order. **If date filtering is ever added, this is the first thing to fix.** |
| `participatingSides`, `significance` as separate fields | Sides folded into the `cmd` strings, significance into `desc` | Two fields of prose per stop was more structure than the panel renders. |

Two things the Leaflet move cost, recorded so nobody rediscovers them as bugs:

- **One finger now pans the map instead of scrolling the page.** The d3 version filtered single-finger touches so the page scrolled and two fingers zoomed. That is standard Leaflet behaviour and standard map behaviour, but it is a change. Restoring the old feel needs a gesture-handling layer.
- **Bundle size.** The old single file was 304KB; `dist/index.html` is 597KB, because Leaflet and proj4 ship with it and JSON inlines as JavaScript. Gzipped it is 225KB.

### Battle Lens: why there is no tactical diagram

The brief asked for a tactical view of Austerlitz, Waterloo and Borodino. The research found **digitised battle plans as images, and nothing else**. A scanned plan, a georeferenced map and a dataset of troop positions are three different things, and only the first exists in open collections for these battles.

So no troop positions, formations or battlefield geometry are drawn anywhere — inventing them would be exactly the fabrication the brief forbids. What Battle Lens became is the archive drawer: the period plan presented as an archival document, with its catalogue record. **This is a blocked feature, not a finished one.**

To unblock it you would need either a georeferenced troop-position dataset, or ground-control points allowing a scanned plan to be warped onto the map — in both cases with licensing that permits redistribution.

Still open: a 1812-peak frontiers layer (no dataset covers it), and per-stop page references rather than work-level ones.

One correction worth keeping: the brief calls for "Renaissance cartography as an artistic influence". The reference image is not Renaissance, it is a Victorian steel engraving of the 1796 campaigns. The plate styling follows the reference, not the brief's wording, because the brief itself forbids presenting Renaissance maps as Napoleonic-era documents.

## Ideas for next steps

- Hash/deep links (`#austerlitz`) so a specific stop can be shared.
- A "myths vs facts" mode, or a short quiz at the end.
- Optional historical frontiers (Empire at its 1812 peak) as a toggle layer.
- Major rivers (Danube, Rhine, Neman, Berezina) as a faint layer, since several stops are river crossings.
- A companion page for the Tudors / Anne Boleyn in the same visual style.
- Deploy as a static site (e.g. Vercel or GitHub Pages).