# Recommendation Engine

## Purpose
Give fans and visitors a sense that the platform understands their taste, and
give the surface a clean, reusable structure so EMG LOOP and Neon can power real
recommendations later. No specific artists are ever fabricated.

## Current placeholder behavior
- Implemented in `assets/js/recommendations.js` as `window.Recommendations`.
- All results are clearly-labeled placeholders. Uses only real place/category
  vocabulary (city names, art forms) and generic copy such as
  "First exhibits opening soon" and "Roadie is learning your taste".
- Personalization basis comes from Roadie Memory when available.

## API
- `getRecommendations(context)` - grouped, labeled placeholder sections:
  Because You Liked, Roadie's Picks, Trending Near You, Similar Exhibits,
  New in Your City, Featured Art Forms.
- `getRoadiePicks(context)`
- `getTrendingCities()`
- `getFeaturedArtForms()`
- `getEmptyRecommendationState()`

## Future backend behavior
EMG LOOP behavioral signals + Neon data will replace the placeholder generators.
The public API stays the same; only the internals change from static placeholders
to ranked, personalized results. Claude may summarize why an exhibit is
recommended.

## Relevant events
- `recommendation_viewed`

## Acceptance criteria
- Reusable recommendation component exists.
- No fake artists.
- Hooks ready for EMG LOOP later. No console errors.
