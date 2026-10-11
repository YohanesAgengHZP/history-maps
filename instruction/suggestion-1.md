# Enhancement Task: The Eagle's Road — Interactive Historical Experience

<role>
Act as a senior frontend engineer, interaction designer, and historical cartography specialist. Improve the existing Eagle's Road application while preserving its current visual identity and working functionality.
</role>

## Objective

Transform the existing Napoleonic campaign atlas from a map with a timeline into an immersive, interactive historical journey through Napoleon Bonaparte's rise, campaigns, downfall, and exile.

The current design is already established. Preserve the dark navy cartographic canvas, ivory editorial serif typography, muted blue and gold markers, subtle borders, and restrained military-atlas aesthetic.

Do not redesign the application from scratch.

## Feature 1: Guided Campaign Journey

Upgrade the existing "Play the journey" interaction into a guided historical presentation.

When activated:
- Begin with the earliest chronological event.
- Move the map to the selected location using smooth, restrained camera transitions.
- Reveal documented routes progressively where route data exists.
- Highlight the current battle marker and dim unrelated markers.
- Update the event dossier, date, historical narrative, and timeline selection.
- Offer pause, resume, previous, next, and exit controls.
- Allow direct navigation to any event without restarting the entire journey.
- Respect reduced-motion preferences.

Keep the journey user-controlled. Do not automatically move the map when a user is reading a dossier.

Never present straight lines connecting battle locations as actual military marching routes. Distinguish confirmed route data from illustrative connections.

## Feature 2: Interactive Battle Dossiers

Enhance the existing right-hand information panel without making it unnecessarily larger.

For each event, provide:
- Event name and date.
- Location and geographic coordinates.
- Participating sides and commanders.
- Napoleon's involvement.
- Outcome and historical significance.
- A concise narrative.
- Sources supporting the historical claims.

Add expandable sections for further reading, tactical context, and archival references.

For selected major battles, add a "Battle Lens" interaction that switches from the geographic overview to a simplified tactical diagram.

Only show troop positions, movements, terrain, and tactical details supported by reliable historical sources. Clearly identify illustrative reconstructions.

If sufficient verified tactical information is unavailable, retain the normal map rather than generating fictional formations.

## Feature 3: Map Layers

Introduce a small, unobtrusive layer selector with options appropriate to the available data:

1. Campaign overview.
2. Battle outcomes.
3. Historical territorial context.
4. Documented campaign routes.

Each layer should have a clear legend and update the map without resetting the current selection or timeline position.

Historical territorial boundaries must be time-aware. Do not display modern borders as if they were the political boundaries of 1805 or 1812.

If reliable historical boundary data is unavailable, omit that layer rather than inventing territorial shapes.

## Feature 4: Historical Timeline

Improve the existing timeline while preserving its compact visual design.

- Make individual timeline markers interactive.
- Clearly distinguish battles, political turning points, sieges, and personal milestones.
- Allow filtering by campaign, outcome, and Napoleon's personal involvement.
- Make the selected year and event visually obvious.
- Support keyboard navigation.
- Provide concise labels or tooltips without obscuring the map.

When a timeline event is selected, update the dossier and map consistently.

## Feature 5: Archive Drawer

Add an optional archive view to selected historical events.

Include relevant primary-source excerpts, proclamations, correspondence, period maps, or historical engravings when available.

For every archival item:
- Display its title, date, origin, and source.
- Provide attribution and licensing information where applicable.
- Distinguish original documents from modern interpretations or reconstructions.
- Never fabricate historical quotations or documents.

Use a restrained document-viewing interface that feels consistent with the existing design rather than turning the app into a collection of decorative parchment cards.

## Feature 6: Historical Reflection

For a small number of major turning points, add an optional reflection panel.

Examples:
- Why was Austerlitz such a consequential victory?
- What changed during the Russian campaign of 1812?
- Why did the coalition regain the initiative in 1813?
- What factors contributed to the defeat at Waterloo?

Present evidence-based explanations and distinguish historical interpretation from established fact.

Avoid gamified scoring systems that reduce complex historical outcomes to simplistic victory points.

## Feature 7: Personal Gift Experience

Preserve the title "The Eagle's Road" and the existing dedication.

Add:
- A refined introductory experience.
- A short explanation of the atlas and its chronological scope.
- A clear way to begin exploring.
- A concluding chapter covering Saint Helena and Napoleon's death in 1821.
- A subtle way to return to the map after completing the journey.

Keep personal details editable and do not invent the recipient's name.

## Engineering Constraints

Before implementing:
1. Inspect the existing codebase and identify its framework, mapping library, data model, and interaction handlers.
2. Identify which features already exist and can be improved instead of replaced.
3. Preserve all existing map navigation, filtering, timeline, dossier, and responsive behavior.
4. Implement enhancements incrementally using the current architecture.
5. Keep historical content and geographic data separate from presentation logic.
6. Avoid unnecessary dependencies, backend services, and rewrites.
7. Keep animation lightweight and performant.

Test the interactions with the actual battle dataset. Verify keyboard accessibility, mobile layout, marker selection, timeline synchronization, map navigation, and reduced-motion behavior.

## Implementation Priority

Phase 1:
- Guided Campaign Journey.
- Better timeline-to-map synchronization.
- Improved battle dossiers.

Phase 2:
- Battle Lens for selected battles.
- Historical map layers where reliable data exists.
- Archive Drawer.

Phase 3:
- Historical Reflection.
- Refined opening and closing experiences.
- Final interaction and accessibility polish.

Implement Phase 1 first, then assess the result before proceeding.

Do not replace functioning features with static mockups. Do not fabricate historical content to make the interface appear complete.

<task>
Inspect and enhance the existing Eagle's Road project according to this specification. Start with Phase 1, preserve the current visual design, and report what was implemented and tested.
</task>