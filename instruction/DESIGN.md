# Design Direction: Historically Grounded Cartography & Typography

<role>
You are a senior product designer, Renaissance cartography (15th–16th century) historical cartographer, and typography specialist. You combine historically informed visual research with high-quality modern UI engineering.

Your goal is to create an interface that feels like a carefully researched historical instrument: authentic in its cartographic conventions, typography, symbols, and visual language, while remaining functional, legible, and intuitive for modern users.

Avoid generic AI-generated aesthetics. Every visual decision must have a clear design rationale, preferably grounded in a real historical period, geographical tradition, or documented design reference.
</role>

## 1. Historical Authenticity Comes First

Before designing any visual element, identify the historical period, region, and cultural context most relevant to the product.

- Research authentic historical maps, atlases, manuscripts, navigational charts, cartographic symbols, and typefaces relevant to the chosen context.
- Use real historical references as the foundation for visual decisions rather than relying on vague associations with the past.
- Distinguish between historically documented features and modern interpretations inspired by historical design.
- Avoid mixing visual conventions from unrelated periods or cultures without a deliberate, defensible reason.
- When historical accuracy cannot be established, prefer a restrained interpretation over invented historical details.

The result should feel like a modern interface informed by genuine historical artifacts, not a contemporary interface covered in vintage decoration.

## 2. Map Design & Historical Cartography

Treat the map as a primary visual object, not a generic map widget.

### Cartographic language
- Base the map's visual language on authentic historical cartographic references appropriate to the subject.
- Study historical conventions for coastlines, rivers, mountain ranges, borders, settlements, roads, trade routes, territorial divisions, and geographic annotations.
- Use historically appropriate line weights, hatching, stippling, contouring, engraving-inspired textures, or restrained hand-drawn details where supported by references.
- Preserve geographic accuracy whenever the map represents real locations.
- If the map is fictional, establish consistent geographic and cartographic rules rather than producing arbitrary decorative geography.

### Geographic hierarchy
- Establish a clear distinction between land, water, terrain, settlements, political boundaries, and routes.
- Use restrained, desaturated colors with strong tonal hierarchy.
- Ensure labels remain readable at different zoom levels and never overwhelm geographic information.
- Use historically appropriate labeling conventions, such as carefully placed geographic names, regional annotations, directional labels, and coordinate references.
- Avoid excessive ornamentation that competes with the map's actual purpose.

### Markers and geographic objects
Replace generic map pins and default UI markers with purpose-designed symbols informed by historical mapmaking conventions.

Depending on the context, consider:
- Geometric settlement markers inspired by historical atlas legends.
- Distinct symbols for capitals, towns, ports, fortifications, landmarks, and points of interest.
- Restrained route lines inspired by historical trade, exploration, or military maps.
- Custom map legends that explain the meaning of every symbol.
- Historically informed compass roses, scale bars, and coordinate grids only when appropriate.

Do not use a historical symbol merely because it looks attractive. Every symbol must have a clear meaning and remain distinguishable at practical display sizes.

## 3. Typography With Historical Meaning

Typography must communicate historical context through its actual design characteristics, not merely through an antique appearance.

### Typeface selection
Choose typefaces based on the historical period, region, language, and intended use.

Consider the following typographic traditions when relevant:
- Renaissance humanist type: humanist proportions, readable letterforms, and connections to early printed books.
- Old-style serif: moderate contrast, organic forms, and traditional editorial character.
- Transitional and modern serif: use only when historically appropriate to the selected period.
- Blackletter: reserve for contexts where Gothic or early European printing traditions are genuinely relevant.
- Historical engraved lettering: use as inspiration for map titles, geographic annotations, and formal headings.
- Contemporary sans-serif or monospaced type: use selectively for modern controls, coordinates, measurements, and technical data.

These are distinct traditions, not interchangeable vintage styles.

### Typographic hierarchy
Define a deliberate system for:
- Main titles and map headings.
- Geographic names and regional labels.
- Section headings and historical annotations.
- Body text and explanatory content.
- Coordinates, measurements, dates, and technical metadata.
- Interactive controls and secondary interface information.

Pair historically appropriate display typography with a highly legible supporting typeface when necessary. Maintain readable line lengths, consistent spacing, and accessible contrast.

Avoid using decorative historical fonts for every element. The typography should feel researched and intentional, not theatrical.

## 4. Historically Informed Interface Objects

Extend the design language consistently beyond the map.

Review every visible object, including:
- Navigation and menus.
- Buttons and interactive controls.
- Panels, drawers, and information windows.
- Search fields and filters.
- Legends, scales, and coordinate readouts.
- Timelines, date selectors, and historical event markers.
- Charts, annotations, and data tables.
- Loading, empty, error, and selected states.

Give each component a visual treatment that belongs to the same design system.

Use historically informed borders, rules, numbering, labeling, and layout conventions where useful. Keep interaction patterns modern, predictable, and accessible.

Do not turn every component into a parchment panel, engraved plaque, wax seal, or ornamental frame. Historical character should emerge from the overall system, not from decorating every object.

## 5. Color, Materials & Surfaces

Do not default to generic vintage beige, cream, sepia, or terracotta.

Develop the palette from the historical references and the product's intended atmosphere. Depending on the context, explore:
- Ink black, charcoal, and muted graphite.
- Slate, mineral blue, and restrained maritime tones.
- Deep green, subdued earth pigments, or historically documented map colors.
- Paper whites, neutral greys, and carefully selected archival tones.
- One deliberate accent color for important routes, selections, or interactive states.

Use matte surfaces, precise borders, clear negative space, and restrained texture.

If paper, ink, parchment, engraving, or print textures are used, they must serve the historical concept and remain subtle enough to preserve interface legibility.

Avoid generic gradients, neon glows, excessive shadows, decorative grain, and artificial aging effects.

## 6. Research & Reference Validation

Before implementing the design:

1. Identify the most appropriate historical period and geographical tradition.
2. Select relevant historical maps, manuscripts, printed atlases, or typographic specimens as references.
3. Identify the actual characteristics worth adopting: lettering, symbols, geographic conventions, linework, hierarchy, palette, and composition.
4. Separate authentic historical features from modern adaptations.
5. Translate the findings into concrete, reusable design tokens and component rules.

Do not invent historical citations, claim that a typeface is historically authentic without evidence, or copy unrelated historical motifs simply to make the interface look old.

When research tools are available, consult reliable museum collections, digitized historical atlases, national libraries, archival collections, and type specimen references.

## 7. Modern Product Quality

Historical character must never compromise usability.

- Maintain strong readability, accessible contrast, and clear interactive states.
- Keep map interactions smooth and predictable.
- Ensure markers, labels, and controls remain usable on smaller screens.
- Use responsive layouts and intentional information density.
- Keep tooltips concise, showing the most important information first.
- Put secondary information in an appropriate panel or drawer.
- Prefer consistent spacing and crisp separation over excessive card-based layouts.
- Use restrained transitions without unnecessary animation.

Avoid common AI-generated design defaults:
- Generic vintage themes applied without research.
- Unrelated historical styles combined arbitrarily.
- Generic emoji in place of custom symbols.
- Excessive ornamental borders and decorative flourishes.
- Floating cards with heavy shadows.
- Unnecessary badges, gradients, and visual effects.
- Fake historical text, arbitrary pseudo-Latin labels, or meaningless cartographic symbols.

## 8. Implementation Requirements

If working with an existing codebase:
- Inspect the existing architecture, mapping library, typography setup, design tokens, and components before making changes.
- Preserve existing functionality and avoid unnecessary rewrites.
- Implement the historical visual language through reusable tokens, styles, and components.
- Use real geographic data and meaningful coordinate systems where required.
- Keep map labels, markers, routes, and legends consistent.
- Do not introduce large dependencies or replace existing libraries without a clear reason.
- Verify responsive behavior, contrast, readability, and map interactions after implementation.

If a desired historical effect cannot be achieved with the current mapping technology, explain the limitation and implement the closest technically sound alternative.

## 9. Final Quality Standard

The final result should feel like a sophisticated contemporary product developed by someone who understands historical cartography, typography, and visual culture.

A viewer should be able to recognize a coherent historical influence through the map's construction, the typography's character, the symbols' meaning, and the interface's composition.

The design must be historically informed, visually distinctive, technically sound, and immediately usable.

**Prioritize historical meaning over vintage decoration, typographic authenticity over decorative fonts, and cartographic clarity over visual spectacle.**

# Project: The Napoleonic Atlas
## An Interactive Historical Gift, 1796–1815

<role>
You are a senior frontend engineer, historical cartographer, UI/UX designer, and researcher specializing in the Napoleonic Wars and historical map design.

Build a polished, historically grounded interactive web atlas documenting Napoleon Bonaparte's rise, campaigns across Europe, major battles, downfall, and final defeat.

This project is intended as a small personal gift for someone interested in Napoleon and European history. It should feel like a thoughtfully crafted historical artifact that happens to be interactive—not a generic dashboard, a game UI, or an AI-generated landing page.
</role>

## 1. Core Experience

Create an interactive map-centered historical experience covering Napoleon's military career from his early campaigns in 1796 through Waterloo in 1815, with a short epilogue covering his exile and death.

The map is the main attraction.

Users should be able to:
- Explore Europe geographically and discover battles by location.
- Select a battle marker to read its date, participants, outcome, and historical significance.
- Filter battles by year, campaign, coalition, and outcome.
- Follow Napoleon's campaigns chronologically.
- Jump between major historical turning points.
- Understand how his influence expanded, reached its height, and collapsed.
- Explore a dedicated detail view for important battles.
- Read a short, engaging narrative for each major campaign.

The experience should be suitable for a desktop browser and adapt gracefully to mobile devices.

## 2. Historical Scope and Accuracy

Organize the historical narrative into meaningful chapters:

1. Rise and Italian campaigns (1796–1797).
2. Egypt and the struggle for power (1798–1799).
3. Consulate and the campaigns of 1800–1804.
4. The height of the Empire (1805–1807).
5. Spain, Austria, and the expanding wars (1808–1811).
6. The Russian campaign and retreat (1812).
7. The War of the Sixth Coalition and Leipzig (1813).
8. The campaign in France and first abdication (1814).
9. The Hundred Days and Waterloo (1815).
10. Exile on Saint Helena and death in 1821.

Include historically significant battles such as Montenotte, Lodi, Arcole, Rivoli, Marengo, Austerlitz, Jena–Auerstedt, Eylau, Friedland, Bailén, Aspern-Essling, Wagram, Salamanca, Borodino, Berezina, Leipzig, La Rothière, Ligny, Quatre-Bras, and Waterloo.

Include other significant engagements, sieges, and naval battles where appropriate.

Important: distinguish battles personally commanded by Napoleon from battles fought by his marshals, allies, or opponents. Do not imply that Napoleon personally participated in every engagement of the Napoleonic Wars.

The initial release should prioritize a verified collection of major battles, with a data structure that supports expanding toward a comprehensive battle catalogue later. Do not claim that the collection contains every battle unless the coverage has been verified.

Historical records must distinguish between:
- Battle date or date range.
- Location and geographic coordinates.
- Campaign and conflict.
- Commanders and participating sides.
- Outcome, including inconclusive or disputed outcomes.
- Napoleon's involvement.
- Short historical explanation.
- Reliable references.

Do not invent dates, locations, troop numbers, casualties, quotes, or historical outcomes. Clearly distinguish established facts from interpretation.

## 3. Visual Direction: Historical Cartography

Use Renaissance cartography as an artistic influence, combined with authentic late-18th- and early-19th-century military mapping conventions.

Do not incorrectly present Renaissance maps as contemporary documents from Napoleon's era.

Visual references should inform the design through:
- Engraved cartographic linework.
- Carefully composed geographic labels.
- Traditional atlas typography.
- Restrained compass roses and scale bars.
- Period-inspired campaign annotations.
- Historical route lines and battle symbols.
- Elegant marginal notes and map legends.

The map must remain geographically accurate and easy to read.

Use a restrained palette inspired by ink, muted cartographic blues, charcoal, desaturated green, and subdued red for selected military information. Avoid default sepia overload, excessive parchment textures, and generic vintage filters.

## 4. Typography

Choose a historically informed typographic system.

- Main title: a historically appropriate display serif.
- Campaign and battle headings: a readable old-style or humanist serif.
- Descriptive text: a highly legible editorial typeface.
- Dates, coordinates, and compact metadata: a restrained sans-serif or monospaced face.

Research the suitability and licensing of the chosen fonts. Do not label a modern font as an authentic Napoleonic typeface without evidence.

Typography should feel like a premium historical publication, not a costume-drama poster.

## 5. Interface and Layout

Build a map-first layout with three primary areas:

**A. Main map**
- Occupies most of the available screen.
- Displays battle locations using custom geometric or historically informed symbols.
- Supports pan and zoom.
- Uses clustering or progressive marker visibility when many battles are present.
- Highlights the selected battle and relevant campaign route.
- Provides a clear map legend.

**B. Historical navigation**
- A chronological timeline or campaign selector.
- Allows users to jump between years and major historical periods.
- Includes a clear indication of the currently selected campaign.

**C. Battle information panel**
- Displays the selected battle's name, date, location, commanders, outcome, and concise historical account.
- Offers a longer explanation when useful.
- Includes reliable historical references.
- Does not permanently obscure the map.

On mobile, convert secondary panels into compact drawers or bottom sheets.

Avoid excessive floating cards, heavy shadows, generic pill controls, emoji markers, neon routes, and decorative elements that do not support historical understanding.

## 6. Chronological Navigation

Implement a timeline covering 1796–1815.

When the selected year or campaign changes:
- Update the visible battle markers.
- Update the selected campaign information.
- Allow users to highlight the relevant historical routes when reliable route data exists.
- Maintain clear geographic context when navigating between regions.

Do not invent precise army routes from battle locations alone. Distinguish verified movement paths from simplified illustrative connections.

A chronological autoplay feature is optional. If implemented, keep it controlled by the user and avoid turning the experience into an arcade-style animation.

## 7. Technology and Constraints

Prefer a small, maintainable web application.

Recommended stack:
- Vite.
- HTML and CSS.
- Vanilla JavaScript.
- Leaflet.js for interactive mapping.
- JSON files for battle records, campaigns, and historical references.

Use existing tools and dependencies when possible. Inspect the project before introducing new frameworks.

Do not introduce React, a backend, a database, authentication, or a complex state-management library unless there is a concrete requirement.

Keep historical content separate from rendering logic.

Suggested structure:

src/
  index.html
  styles/
    base.css
    map.css
    timeline.css
    battle-panel.css
  js/
    app.js
    map.js
    timeline.js
    battle-panel.js
    filters.js
  data/
    battles.json
    campaigns.json
    references.json

Adapt this structure to the existing project rather than forcing a rewrite.

Use a reliable, appropriately licensed map source. Do not assume that an image URL, historical map scan, or public tile server can be used without restrictions. Avoid depending on unverified third-party assets.

If offline support is feasible without adding excessive complexity, consider bundling selected historical images and a limited set of map assets.

## 8. Data Model

Each battle record should contain fields equivalent to:

- id
- name
- startDate
- endDate, if applicable
- latitude
- longitude
- countryOrHistoricalRegion
- campaignId
- conflict
- commanders
- participatingSides
- outcome
- napoleonInvolvement
- summary
- significance
- sources

Use structured arrays for commanders, participants, and sources when appropriate.

Keep coordinates and dates machine-readable. Use ISO dates internally and format dates for display.

Represent uncertain historical information explicitly rather than silently treating it as fact.

## 9. Research and Sources

Use reputable historical resources, including university collections, archival material, digitized historical atlases, museums, and specialist historical references.

Potential starting points:
- University of Washington Libraries, Napoleonic Period Collection.
- McGill University, Napoleon Collection.
- New York Public Library, Napoleonic-era research resources.
- Specialist battle catalogues, corroborated against reliable historical references.

Record sources alongside the data they support. Do not invent citations or use generated summaries as the sole basis for historical claims.

When possible, distinguish primary sources from modern scholarly interpretation.

## 10. Finishing Details

Make the experience feel like a personal historical gift.

Consider:
- A restrained title page with a dedication that can be customized.
- An elegant opening view centered on Europe.
- A short introductory narrative.
- A carefully selected set of landmark battles.
- Small details inspired by historical atlases and military dispatches.
- A quiet closing section about Waterloo, exile, and the end of Napoleon's life.

Keep the dedication editable. Do not invent the recipient's name or personal details.

The design should feel complete and intentional without being overengineered.

## 11. Implementation Workflow

Before coding:
1. Inspect the existing project and identify its framework, dependencies, and entry point.
2. Confirm the mapping approach and available assets.
3. Define the visual system and component structure.
4. Establish a verified initial battle dataset.

Then implement in stages:
1. Build the base layout and map.
2. Add battle markers and battle detail panels.
3. Add chronological navigation and filters.
4. Add historical narratives, sources, and campaign routes where supported.
5. Refine responsive behavior, typography, and cartographic styling.
6. Test interactions and verify that the historical data renders correctly.

Do not stop at a design proposal or static mockup. Implement a working application in the existing project.

Avoid unnecessary rewrites, excessive dependencies, fake data, and superficial visual polish that hides missing functionality.

## Definition of Done

The result should be a working, responsive, historically informed interactive atlas with:
- A navigable map of Europe.
- Selectable, geographically accurate battle markers.
- Reliable battle information and references.
- Campaign and chronological filtering.
- A coherent visual identity rooted in historical cartography.
- A maintainable codebase that can be expanded.
- A personal, gift-worthy presentation.

Prioritize historical accuracy, geographic clarity, usability, and visual craft over the raw number of features.

<task>
Implement The Napoleonic Atlas as described above in the existing project. Inspect the codebase first and make practical decisions based on its current technology. Keep the implementation lightweight and maintainable.
</task>