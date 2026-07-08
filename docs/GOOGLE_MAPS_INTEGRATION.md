# Google Maps Integration

City / ZIP autocomplete and local creative discovery are powered by Google Places, always through server-side Netlify Functions. The Google Maps key never reaches the browser.

## Where it lives

- Autocomplete function: `netlify/functions/maps-autocomplete.js`
- Local search function: `netlify/functions/maps-creative-search.js`
- Client helpers + UI: `assets/js/app.js` (exposes `window.MapsLive`, mounts the city guide, search autocomplete, and the events venue finder)

## Environment variables

- `GOOGLE_MAPS_API_KEY` (required) - read from `process.env` inside the functions only.

## Autocomplete

`POST /.netlify/functions/maps-autocomplete`

```json
{ "input": "nash", "types": ["city","postal_code"], "country": "us" }
```

Returns normalized predictions:

```json
{ "predictions": [ { "label": "Nashville", "place_id": "...", "description": "Nashville, TN, USA", "city": "Nashville", "state": "TN", "zip": null } ] }
```

- Minimum 3 characters. Requests under 3 chars return an empty list without calling Google.
- Uses Google Places Autocomplete with `types=(regions)` (or `geocode` for ZIP) and `components=country:us`.

## Local creative search

`POST /.netlify/functions/maps-creative-search`

```json
{ "location": "Nashville, TN", "lat": null, "lng": null, "radius": 8000, "category": "art_gallery" }
```

Supported categories: `art_gallery, museum, music_venue, performing_arts, art_supply, recording_studio, dance_studio, photography_studio, coffee_shop, coworking, frame_shop, print_shop`.

Returns normalized places:

```json
{ "places": [ { "name": "...", "address": "...", "rating": 4.6, "user_ratings_total": 210, "place_id": "...", "lat": 36.1, "lng": -86.7, "google_maps_url": "https://www.google.com/maps/place/?q=place_id:...", "category": "art_gallery" } ] }
```

- Categories are mapped to safe Google text queries (for example `art_gallery` -> "art gallery").
- Result count is capped at 12. Radius is capped at 50000 meters.
- If nothing is found, an empty array is returned with a friendly `message`. Places are never invented.

## Where it appears

- City pages (`data-roadie-context="city"`): a "Explore {City} in person" guide with category buttons. Data is fetched only when a category is clicked (no heavy auto-fetch on load).
- Events page (`data-roadie-context="events"`): a venue finder for locations only. Live event listings still come from ticketing partners (Ticketmaster / Eventbrite / Bandsintown placeholders).
- Search inputs: city / ZIP autocomplete dropdown after 3+ characters; the selected city is stored in RoadieMemory.

## Analytics events

- `location_search`, `location_selected`, `local_search`.

## Known limitations

- Google Places may return chains and non-arts businesses for broad categories; queries are tuned but not perfect.
- No client-side map rendering yet; results are cards that link out to Google Maps.
