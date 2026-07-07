# Command Palette

## Purpose
A fast, keyboard-first way to move around ArtistsInMyCity, echoing the "creative
operating system" feel. Lets users jump to cities, categories, the studio, or
open Roadie without hunting through menus.

## Current placeholder behavior
- Implemented in `assets/js/sprint5.js`, loaded site-wide via the shared loader.
- Triggers: `Ctrl+K`, `Cmd+K`, and `/`. The `/` shortcut is ignored while the
  user is typing in an input, textarea, select, or contenteditable field.
- Dark modal with a search input, grouped results (Explore, Studio, Roadie,
  Join, Info), and a hint bar.
- Keyboard navigation: Up/Down to move, Enter to select, Esc to close. Mouse
  hover and click also work.
- Actions navigate to a page, open Roadie, or focus the site search.
- Mobile users can reach the same destinations via the existing search icon/nav.

## Future backend behavior
Results will expand to include live cities, categories, events, and (once
published) real Digital Exhibits from Neon, ranked with EMG LOOP signals. A
"recent" section can surface each user's history from Roadie Memory / Neon.

## Relevant events
- `command_palette_opened`
- `command_palette_action_selected`

## Acceptance criteria
- Keyboard shortcut works.
- Does not break typing in inputs.
- Results navigate correctly.
- No console errors. Mobile accessible via search icon/button.
