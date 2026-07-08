# EMG LOOP Webhook -> Neon Event Pipeline

Sprint 10 connects ArtistsInMyCity to **EMG LOOP**. Site activity is sent
server-side to LOOP, and LOOP stores it in Neon. The browser never writes to
Neon and never sees the webhook secret or any database connection string.

## Architecture

```
Browser (window.AIMCLoop.track)
        |  POST normalized event (no secrets)
        v
Netlify Function  /.netlify/functions/loop-event
        |  adds env config, signs with HMAC-SHA256
        v
EMG LOOP Webhook  (EMG_LOOP_WEBHOOK_URL)
        |
        v
Neon (managed entirely by LOOP)
```

Only the Netlify Function talks to LOOP. Only LOOP talks to Neon.

## Required Netlify environment variables

Set these in Netlify (Site settings -> Environment variables). None are ever
exposed to the browser.

| Variable | Required | Purpose |
| --- | --- | --- |
| `EMG_LOOP_WEBHOOK_URL` | Yes | Destination LOOP webhook endpoint the function POSTs to. |
| `EMG_LOOP_WEBHOOK_SECRET` | Yes | Shared secret used to HMAC-sign each request. |
| `AIMC_SITE_ID` | No | Site identifier. Defaults to `artistsinmycity`. |
| `AIMC_PLATFORM_ID` | No | Platform identifier. Defaults to `artistsinmycity`. |

Example (`.env` / Netlify UI, values are placeholders):

```
EMG_LOOP_WEBHOOK_URL=
EMG_LOOP_WEBHOOK_SECRET=
AIMC_SITE_ID=artistsinmycity
AIMC_PLATFORM_ID=artistsinmycity
```

If `EMG_LOOP_WEBHOOK_URL` or `EMG_LOOP_WEBHOOK_SECRET` is missing, the function
returns a safe setup error (`503 LOOP webhook not configured`) and the browser
queues the event locally for retry. No secret values are ever returned.

## Netlify function: loop-event

Path: `netlify/functions/loop-event.js`

- POST only (other methods return `405`).
- Validates JSON body; requires `event_name` (`400` otherwise).
- Generates `event_id` if not supplied.
- Adds `occurred_at` / `received_at` timestamps.
- Adds `platform_id`, `site_id`, `site_url`, `environment`, `source: web`.
- Passes through `anonymous_id`, `clerk_user_id`, `role`, `session_id`, `page_url`, `referrer`, `payload`.
- Signs the request with HMAC-SHA256 over `timestamp + "." + body`.
- Forwards to `EMG_LOOP_WEBHOOK_URL` with headers `X-AIMC-Signature`, `X-AIMC-Timestamp`, `X-AIMC-Platform`.
- Returns only non-sensitive identifiers on success.
- Never returns stack traces, secrets, or the Neon connection string.

### Normalized event shape

```json
{
  "event_id": "uuid",
  "event_name": "page_view",
  "occurred_at": "ISO-8601",
  "received_at": "ISO-8601",
  "platform_id": "artistsinmycity",
  "site_id": "artistsinmycity",
  "site_url": "https://artistsinmycity.com",
  "environment": "production",
  "source": "web",
  "anonymous_id": "uuid-or-null",
  "clerk_user_id": "user_xxx-or-null",
  "role": "artist|fan|creator|admin-or-null",
  "session_id": "sess_xxx-or-null",
  "page_url": "string-or-null",
  "referrer": "string-or-null",
  "payload": {}
}
```

### Response codes

| Code | Meaning |
| --- | --- |
| 200 | Event accepted and forwarded to LOOP. |
| 400 | Invalid JSON, invalid body, or missing `event_name`. |
| 405 | Non-POST method. |
| 502 | LOOP rejected the event or was unreachable (browser queues). |
| 503 | Webhook not configured (missing env vars). |

## Frontend: window.AIMCLoop

Defined in `assets/js/loop-events.js`. The Sprint 10 extension wraps the
existing `track()` and `emit()` so every event is forwarded server-side while
keeping GA mirroring and existing local behavior.

```js
window.AIMCLoop.track("search_performed", { query: "jazz" });
```

Behavior:

- Builds a normalized event (adds `anonymous_id`, `clerk_user_id`, `role`,
  `session_id`, `page_url`, `referrer`, `source: web`).
- POSTs to `/.netlify/functions/loop-event`.
- On failure, queues the event in `localStorage` under `aimc.loop.queue`.
- Retries the queue on page load and on the browser `online` event.
- Continues to mirror events to GA4 via `AIMC.trackEvent`.

The `anonymous_id` is persisted in `localStorage` under `aimc.anon_id`.

### Local fallback / dev note

The `aimc.loop.queue` localStorage queue is a resilience fallback for failed or
offline sends -- not a substitute for the server pipeline. It drains automatically
once the function and LOOP webhook are reachable.

## Event coverage

Minimum events tracked through the pipeline:

- `page_view`
- `city_view`
- `category_view`
- `search_performed`
- `location_search`
- `location_selected`
- `roadie_chat_started`
- `roadie_message_sent`
- `roadie_response_received`
- `roadie_error`
- `artist_onboarding_started`
- `artist_onboarding_completed`
- `artist_theme_changed`
- `collection_created`
- `collection_updated`
- `artist_uploaded_media`
- `artist_previewed`
- `artist_published`
- `fan_signup`
- `artist_signup`
- `fan_followed_artist`
- `fan_saved_exhibit`
- `event_search`
- `maps_creative_search`
- `booking_request`
- `merch_click`
- `ticket_click`
- `notification_opened`
- `command_palette_opened`

## Security model

- The browser never receives `EMG_LOOP_WEBHOOK_SECRET`.
- The browser never receives any Neon connection string or credentials.
- The browser never writes to Neon directly.
- Requests to LOOP are signed server-side with HMAC-SHA256.
- Errors return generic messages only -- no stack traces or secret values.
- Client-supplied `clerk_user_id`/`role` are contextual analytics fields only and
  should be treated as untrusted by LOOP (verify against Clerk if authoritative).

## Related files

- `netlify/functions/loop-event.js` -- signing + forwarding function.
- `assets/js/loop-events.js` -- `window.AIMCLoop` layer + pipeline.
- `docs/BUILD_STATUS.md` -- sprint history.
