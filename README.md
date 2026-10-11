# The Eagle's Road

An interactive atlas of Napoleon Bonaparte's life and campaigns, from his birth in Ajaccio in 1769 to his death on St Helena in 1821. Thirty-nine stops, drawn as an engraved atlas plate.

Built as a personal gift. The tone is meant to stay friendly, curious and accurate — not romantic.

## Running it

```bash
npm install
npm run dev       # vite dev server
npm run build     # -> dist/index.html
```

`npm run build` inlines every script, style and data file into a single `dist/index.html`. Nothing is fetched at runtime except the Google Fonts stylesheet: no tiles, no images, no audio files.

## Licence

**GPL-3.0.** Not a stylistic choice: the historical frontiers data is GPL-3.0, and bundling it into the build carries that licence to the whole distribution. See `LICENSE`.

## Sources

| What | Source | Licence |
|---|---|---|
| Coastlines | [Natural Earth](https://www.naturalearthdata.com/) via `world-atlas` | Public domain |
| Terrain relief | NOAA [ETOPO](https://www.ncei.noaa.gov/products/etopo-global-relief-model), rendered as hachures | Public domain |
| Historical frontiers, 1800 and 1815 | [Historical Basemaps](https://github.com/aourednik/historical-basemaps), André Ourednik and contributors | GPL-3.0 |
| Archival plans and engravings | [Wikimedia Commons](https://commons.wikimedia.org/), linked to each holding institution | Public domain / CC0 |
| Letters to Joséphine | Henry Foljambe Hall's 1901 translation, [Project Gutenberg 37499](https://www.gutenberg.org/ebooks/37499) | Public domain |
| *La Marseillaise* melody | CC0 MIDI on Commons, synthesised in the browser | CC0 |
| Mapping | [Leaflet](https://leafletjs.com/) (BSD-2-Clause), proj4js (MIT) | — |

The frontiers dataset's own maintainers describe it as work in progress and ask that it be checked against other sources. The app says so too.

## Ground rules

Three rules the content follows, worth knowing before editing:

- **Nothing is invented.** No troop positions, no fabricated quotations, no interpolated boundaries. Where evidence is missing, the app says it is missing.
- **Sources are named.** Every stop lists the works it leans on. Letters are sliced from a scholarly edition rather than retyped, because the versions circulating online are quietly corrupt.
- **Marker size means scale, not fame.** Trafalgar and Lodi are small dots on purpose.

`CLAUDE.md` holds the full engineering and editorial notes, including what was deliberately *not* built and why.
