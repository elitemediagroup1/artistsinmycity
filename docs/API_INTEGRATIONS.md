# API Integrations

All third-party APIs are called from server-side Netlify Functions. No API keys ever appear in browser JavaScript.

## Netlify Functions

| Function | Purpose | Env var | Method |
| --- | --- | --- | --- |
| `roadie-chat.js` | Live Roadie replies via Anthropic | `ANTHROPIC_API_KEY` | POST |
| `maps-autocomplete.js` | City / ZIP autocomplete via Google Places | `GOOGLE_MAPS_API_KEY` | POST |
| `maps-creative-search.js` | Local creative places via Google Places | `GOOGLE_MAPS_API_KEY` | POST |
| `claude-assistant.js` | Legacy assistant stub (preview) | `ANTHROPIC_API_KEY` | POST |
| `loop-webhook.js` | EMG LOOP events | `LOOP_WEBHOOK_URL` / `EMG_LOOP_WEBHOOK` | POST |
| `indexnow-submit.js` | IndexNow URL submission | `INDEXNOW_KEY` | POST |
| `clerk-webhook.js` | Auth webhooks | `CLERK_*` | POST |
| `stripe-webhook.js` | Payments webhooks | `STRIPE_*` | POST |
| `publish-profile.js` | Profile publishing | `GITHUB_*` | POST |

## Client helpers

- `window.RoadieMemory` (`assets/js/roadie-memory.js`) - local personalization, no backend.
- `window.MapsLive` (`assets/js/app.js`) - `autocomplete(input)` and `creativeSearch(opts)` wrappers around the Maps functions.
- Roadie widget (`assets/js/roadie.js`) - posts to `roadie-chat` and renders replies + suggestions.

## Security rules

- Functions are POST-only and reject other methods (405).
- JSON bodies are parsed defensively; invalid input returns a friendly error, never a stack trace.
- Message and input sizes are capped; result counts are capped.
- Provider errors are swallowed and replaced with user-friendly messages.
- No secret, key, or raw provider payload is ever returned to the browser.

## Related docs

- `docs/ROADIE_LIVE_API.md`
- `docs/GOOGLE_MAPS_INTEGRATION.md`
- `docs/26_SECURITY.md`
- `docs/BUILD_STATUS.md`
