# The Eagle's Road — Phase 2 Implementation

Phase 1 is complete. Continue developing the existing application without rewriting or regressing the working features.

## Objective

Implement Phase 2 in three areas:
1. Battle Lens — tactical battle exploration.
2. Historical territorial layer — time-appropriate European boundaries.
3. Archive Drawer — historical documents and primary sources.

Do not stop the entire phase because some datasets are missing. Research the data sources, implement the parts that can be supported, and document any remaining blockers.

## 1. Research Before Implementation

Investigate reliable, usable data sources for:

### A. Battle Lens
Find historical battle maps or battle plans containing useful information about troop positions, formations, movements, and terrain.

Prioritize:
- Digitized historical military maps and battle plans.
- Museum and national-library collections.
- University archives and historical map collections.
- Scholarly publications with referenced battle diagrams.
- Open datasets with clear provenance and licensing.

Start with major battles that have substantial documentation, such as Austerlitz (1805), Waterloo (1815), and Borodino (1812).

Do not assume that a historical battle-plan image contains georeferenced coordinates. A scanned image, a georeferenced map, and a verified dataset of troop positions are different types of evidence.

For each candidate source, record:
- Source title and institution.
- Relevant battle and date.
- Available data or image format.
- Provenance and historical context.
- Licensing and permitted reuse.
- Whether geographic calibration is available.
- Whether troop positions or movements can be supported by the source.

### B. Historical Territorial Boundaries

Find usable historical boundary data for relevant years, particularly 1805, 1812, 1813, and 1815.

Investigate:
- Historical GIS datasets.
- Research projects that publish historical political boundaries.
- Digitized historical atlases.
- Scholarly datasets with explicit temporal coverage and geographic metadata.

Prefer downloadable GeoJSON, shapefile, or another format compatible with the existing mapping library.

For each source, verify:
- The date represented by each boundary.
- The geographic scope and resolution.
- The definition of the boundaries, including states, empires, occupied territories, and dependent states.
- The license and attribution requirements.
- Whether the data is suitable for the existing map projection.

Do not treat a modern political map as a historical boundary dataset.

### C. Historical Archives

Find reliable archival materials relevant to the existing battle records.

Look for:
- Contemporary correspondence and dispatches.
- Proclamations and official documents.
- Historical engravings and battle plans.
- Period maps and military illustrations.

Prefer institutions that provide stable catalog records, provenance, access information, and reuse terms.

Do not invent archival content, quotations, or source metadata.

## 2. Implement Battle Lens Incrementally

Build the Battle Lens experience using verified material for the battles where suitable sources are available.

Requirements:
- Add a dedicated view for supported battles.
- Show the original historical plan or a properly attributed reproduction where licensing permits.
- Add contextual annotations only when they can be supported by the source.
- If geographic calibration is available, allow the user to compare the historical plan with the geographic map.
- Clearly distinguish original source imagery, modern explanatory overlays, and interpretive reconstruction.
- Include a source panel and a way to return to the main map.

If only a historical image is available, display it as an archival battle plan rather than pretending it is a precise interactive troop-position map.

If no suitable source is found for a battle, retain the existing dossier and explain that tactical material is unavailable.

Do not invent formations, troop positions, marching routes, or battlefield geometry.

## 3. Implement the Historical Territorial Layer

Implement a selectable territorial layer only for dates supported by verified historical boundary data.

Requirements:
- Allow the user to select among the available historical snapshots.
- Update the boundary layer when the selected year changes, using the closest verified snapshot only when its temporal limitations are clearly disclosed.
- Distinguish state boundaries from occupation, military control, and contested territory where the source supports those distinctions.
- Provide a legend and source attribution.
- Preserve the current battle selection, map zoom, and timeline state when switching layers.

Do not interpolate territorial changes between snapshots unless a defensible dataset supports that interpolation.

If historical boundary data cannot be obtained, implement the layer interface behind a clearly disabled or unavailable state and document the missing dataset. Do not draw fictional boundaries to complete the UI.

## 4. Implement the Archive Drawer

Use verified archival sources to create a contextual document drawer for selected historical events.

Each entry should include:
- Title.
- Date, when known.
- Author or institution, when known.
- Historical context.
- Source URL or stable catalogue reference.
- Image attribution and licensing details where relevant.

Use genuine archival material or properly licensed reproductions. If external images cannot be embedded legally or reliably, link to the institutional catalogue instead.

Preserve the existing typography, color palette, spacing, and historical cartographic identity.

## 5. Maintainable Data Architecture

Keep the source records separate from the rendering components.

Adapt the existing architecture, but consider separate datasets for:
- Battle-plan metadata.
- Historical boundary snapshots.
- Archival documents.
- Source provenance and licensing.

Every asset or dataset must include sufficient metadata to trace it to its source.

Do not add a backend or large dependencies unless the current architecture requires them.

## 6. Delivery Plan

Work in this order:

1. Audit the existing Phase 1 implementation.
2. Research and report candidate sources for all three features.
3. Implement the Archive Drawer using verified, usable sources.
4. Implement Battle Lens for the first battles with adequate material.
5. Implement the territorial layer for the first years with suitable boundary data.
6. Test the integration with the existing timeline, filters, map, and dossier.
7. Document remaining data gaps and the exact requirements for resolving them.

Do not wait for every battle and every year to have data before implementing supported features.

## Definition of Done

Provide:
- Working Phase 2 features wherever source material supports them.
- A source inventory with provenance and licensing.
- A clear distinction between implemented, partially supported, and blocked functionality.
- Tests for navigation, layer switching, data loading, and existing Phase 1 regressions.
- A concise report listing any remaining data requirements.

<task>
Continue Phase 2 in the existing Eagle's Road repository. Research the source material, implement supported features incrementally, and never fabricate historical geographic or tactical data.
</task>