# EMG Loop Event Gateway - ArtistsInMyCity Producer Integration

ArtistsInMyCity is a **producer** that sends signed behavioral events into the
EMG Loop Event Gateway. This document describes the producer-side integration
only. It does not modify Loop.

## Architecture

```
Browser (assets/js/loop-events.js, window.AIMCLoop)
   |  POST  /.netlify/functions/loop-event      (same-origin, no secret)
   v
Netlify Function (netlify/functions/loop-event.js)
   |  POST  https://app.emgloop.com/api/v1/events
   |        header: x-emg-loop-secret: <EMG_LOOP_WEBHOOK_SECRET>
   v
EMG Loop Event Gateway
```

The webhook secret is read **only** inside the Netlify Function. The browser
never receives it and only ever talks to the same-origin internal function.

## Required Netlify environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `EMG_LOOP_WEBHOOK_URL` | Yes | Loop Event Gateway endpoint the function POSTs to. Set to `https://app.emgloop.com/api/v1/events`. |
| `EMG_LOOP_WEBHOOK_SECRET` | Yes | Shared secret sent in the `x-emg-loop-secret` header. Must equal the Loop `LOOP_EVENT_SECRET`. Server-side only. |

Set both in **Netlify -> Site settings -> Environment variables**. Do not commit
real values; `.env.example` documents the names only.

If either variable is missing, the function logs a warning and no-ops (returns
HTTP 200, `skipped: true`). The site continues to work normally.

## Netlify function: loop-event

Path: `netlify/functions/loop-event.js`

- Accepts `POST` (JSON) from the browser layer at `/.netlify/functions/loop-event`.
- Normalizes the incoming event into the EMG Loop envelope (below).
- Forwards to `EMG_LOOP_WEBHOOK_URL` with a single header: `x-emg-loop-secret`.
- Times out the outbound request (AbortController, ~4s) and swallows all errors
  so page loads are never blocked.
- Never returns Loop internals, stack traces, or secret values to the caller.

### Event envelope (sent to Loop)

```json
{
  "eventId": "uuid",
  "platform": "artistsinmycity",
  "site": "artistsinmycity.com",
  "eventType": "artist.profile_viewed",
  "occurredAt": "ISO-8601",
  "anonymousId": "uuid-or-null",
  "userId": "user_xxx-or-null",
  "sessionId": "sess_xxx-or-null",
  "pageUrl": "string-or-null",
  "referrer": "string-or-null",
  "payload": {},
  "metadata": { "source": "web", "environment": "production", "receivedAt": "ISO-8601" }
}
```

`platform` is always `"artistsinmycity"` and `site` is always
`"artistsinmycity.com"`. `eventId`, `occurredAt`, and `metadata.receivedAt` are
filled in by the function when not supplied.

### Example request to Loop

```
POST https://app.emgloop.com/api/v1/events
content-type: application/json
x-emg-loop-secret: <EMG_LOOP_WEBHOOK_SECRET>

{ "eventId": "1f6...", "platform": "artistsinmycity", "site": "artistsinmycity.com",
  "eventType": "fan.signup_started", "occurredAt": "2026-07-08T00:00:00.000Z",
  "anonymousId": "a1b2...", "userId": null, "sessionId": "sess_9x...",
  "pageUrl": "https://artistsinmycity.com/signup", "referrer": "https://google.com/",
  "payload": { "step": "email" }, "metadata": { "source": "web" } }
```

### Response codes (from the internal function)

| Code | Meaning |
| --- | --- |
| 200 | Forwarded to Loop successfully, or skipped because not configured. |
| 202 | Accepted locally; Loop was unreachable/timed out/non-2xx (UX not blocked). |
| 400 | Missing `eventType` in the request. |
| 405 | Non-POST method. |

## Frontend: window.AIMCLoop

Defined in `assets/js/loop-events.js`. Emit events with:

```js
window.AIMCLoop.track("artist.profile_viewed", { artistId: "123" });
// or the standardized named helpers:
window.AIMCLoop.events.artistProfileViewed({ artistId: "123" });
window.AIMCLoop.events.artistClaimedProfile({ artistId: "123" });
window.AIMCLoop.events.artistSubmittedMusic({ trackId: "abc" });
window.AIMCLoop.events.fanSignupStarted({ step: "email" });
window.AIMCLoop.events.contactFormSubmitted({ form: "booking" });
```

The client posts only to the internal function; it never sends events directly
to Loop and never holds the secret.

## Standardized events

These dot-namespaced events are guaranteed by this integration:

- `artist.profile_viewed`
- `artist.claimed_profile`
- `artist.submitted_music`
- `fan.signup_started`
- `contact.form_submitted`

Existing analytics events continue to flow through `AIMCLoop.track(...)`.

## Security model

- The browser never receives `EMG_LOOP_WEBHOOK_SECRET`.
- The browser only calls the same-origin `/.netlify/functions/loop-event`.
- Requests to Loop are authenticated with the `x-emg-loop-secret` header,
  server-side only. (The previous HMAC headers `X-AIMC-Signature`,
  `X-AIMC-Timestamp`, and `X-AIMC-Platform` have been removed.)
- Errors return generic messages only, no stack traces or secret values.
- Loop dispatch is best-effort: timeouts and failures never block the UX.

## Related files

- `netlify/functions/loop-event.js` -- normalize + forward function (holds secret).
- `assets/js/loop-events.js` -- `window.AIMCLoop` client layer + standardized events.
- `.env.example` -- documents `EMG_LOOP_WEBHOOK_URL` and `EMG_LOOP_WEBHOOK_SECRET`.
