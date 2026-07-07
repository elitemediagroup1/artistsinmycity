# Digital Exhibit Themes

## Purpose
Artists should not all look the same. Curated themes let each Digital Exhibit
express a distinct aesthetic while staying inside the platform's dark, premium
design system.

## Current placeholder behavior
- Theme Builder renders into any `[data-sprint5="theme-builder"]` container
  (present in My Studio and the Exhibit Builder) via `assets/js/sprint5.js`.
- Six curated themes: Gallery, Minimal, Music, Photography, Street, Luxury.
- Each card shows a preview gradient, name, "best for", description, and
  Select / Preview buttons.
- Selecting a theme saves it to `localStorage` (`aimc.exhibit.theme.v1`), marks
  the card selected, records it in Roadie Memory, and updates the preview label.
- No fake artist data. UI only for now.

## Themes
1. Gallery - clean, museum-like, minimal text, large artwork.
2. Minimal - white-space inspired, simple, editorial.
3. Music - audio-first, stage-inspired, track/player areas.
4. Photography - large image grids, cinematic layout.
5. Street - bold, mural-inspired, energetic.
6. Luxury - dark, elegant, premium gallery feel.

## Future backend behavior
The selected theme will be persisted per exhibit in Neon and applied at render
time to the public Digital Exhibit page. Preview will render the real exhibit in
the chosen theme. AI (Claude) may later suggest a best-fit theme from an
artist's media.

## Relevant events
- `artist_theme_changed`
- `artist_previewed` (theme preview)

## Acceptance criteria
- Theme selection works and persists.
- Preview updates visually.
- No fake artist data. No console errors.
