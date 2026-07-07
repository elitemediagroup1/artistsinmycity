# Roadie Memory

## Purpose
Roadie Memory gives Roadie a persistent sense of who the user is so the
platform feels personal instead of like a directory. It stores lightweight
preference and context data and produces a role-aware greeting.

## Current placeholder behavior
- Implemented in `assets/js/roadie-memory.js` and exposed as `window.RoadieMemory`.
- Backed by `localStorage` (key `aimc.roadie.memory.v1`). Persists across refreshes.
- Remembers: role, preferred art forms, selected cities, favorite themes,
  recent searches, recent Roadie messages, onboarding progress, last visited
  pages, plus placeholders for artist publishing history and fan following
  interests.
- No PII beyond what the user enters locally. No backend calls.

## API
- `getMemory()`
- `setMemory(key, value)`
- `updateMemory(partial)`
- `clearMemory()`
- `rememberSearch(query)`
- `rememberCity(city)`
- `rememberArtForm(artForm)`
- `rememberTheme(theme)`
- `rememberRoadieMessage(message)`
- `getPersonalizedGreeting()` returns a role-aware string:
  - public: "Hey! I'm Roadie. Want to explore artists near you?"
  - returning fan: "Welcome back. Want to see what's new in your favorite cities?"
  - returning artist: "Welcome back. Ready to improve your exhibit today?"

Any element with `data-roadie-greeting` is auto-filled with the greeting on load.

## Future backend behavior
The same public interface will be re-implemented on top of Neon (Postgres) and
Clerk identity so memory follows the user across devices. localStorage becomes a
cache/offline layer. No API changes required for callers.

## Relevant events
- `roadie_memory_updated`
- `roadie_preference_saved`

## Acceptance criteria
- Memory persists after refresh.
- Greeting changes based on stored role.
- No backend required. No console errors.
