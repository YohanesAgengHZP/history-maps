// Display vocabulary and the rules that turn data into symbols.
import vocabulary from "../data/vocabulary.json";

export const OUTCOME = vocabulary.outcome;
export const ROLE = vocabulary.role;
export const KIND = vocabulary.kind;
export const TIERS = vocabulary.tiers;

// Marker size carries the scale of the fight, the way the reference plate sizes a town by its
// population. Rank is forces engaged, not fame: Lodi and Trafalgar stay small on purpose.
export const tierOf = (men) => (!men ? 0 : men >= 250000 ? 2 : men >= 100000 ? 1 : 0);
// radii are CSS pixels: Leaflet keeps markers a constant size on screen, so there is no
// counter-scaling to do and no viewBox units to convert from
export const radius = (e) => (e.o === "milestone" ? 6 : TIERS[tierOf(e.men)].r);

export const fmtMen = (n) => n.toLocaleString("en-GB");

// decimal degrees for the panel readout; e.cll covers off-map stops (St Helena)
export const fmtLL = ([lon, lat]) =>
  `${Math.abs(lat).toFixed(2)}° ${lat < 0 ? "S" : "N"} · ${Math.abs(lon).toFixed(2)}° ${lon < 0 ? "W" : "E"}`;

// Leaflet wants [lat, lon]; the historical data is stored [lon, lat]. Everything that crosses
// that boundary goes through here, because getting it backwards puts Paris in the Indian Ocean.
export const toLatLng = (ll) => [ll[1], ll[0]];
