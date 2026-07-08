# Roadie Live API

Roadie is powered by a server-side Netlify Function that calls Anthropic. The Anthropic API key never reaches the browser.

## Where it lives

- Function: `netlify/functions/roadie-chat.js`
- Widget: `assets/js/roadie.js` (existing floating widget, now wired to the function)
- Memory: `assets/js/roadie-memory.js` (local, no backend, no PII beyond local preferences)

## Environment variables

- `ANTHROPIC_API_KEY` (required) - read from `process.env` inside the function only.

## Request

`POST /.netlify/functions/roadie-chat`

```json
{
  "message": "How do I improve my exhibit?",
  "role": "public | artist | fan | creator | admin",
  "page": "/cities/nashville.html",
  "context": {},
  "memory": {}
}
```

## Response

```json
{
  "reply": "string",
  "suggestions": ["string"],
  "mode": "concierge | studio | preview | error"
}
```

## Behavior

- POST only. Other methods return 405.
- Message is validated and limited to 2000 characters.
- If `ANTHROPIC_API_KEY` is missing, the function returns a friendly preview reply (never an error).
- Raw provider errors are never returned to the user. On failure the reply is: "Roadie is tuning up backstage. Try again in a moment."
- The system prompt keeps Roadie on-brand (Digital Exhibit, My Studio, Collections, Audience, Roadie, EMG LOOP) and forbids inventing real artists, events, venues, or prices.

## Analytics events (client side)

- `roadie_chat_started` - when the widget is first opened.
- `roadie_message_sent` - each outgoing message.
- `roadie_response_received` - successful reply.
- `roadie_error` - network or empty-response failure.

Events mirror to `window.aimcTrack` and `window.gtag` when available.

## Studio mode

On artist / My Studio pages the widget sends `role: artist` plus a `context.studio` object (when a page exposes `window.RoadieStudioContext()`), so Roadie can answer exhibit and launch questions with real page context. Generated text is shown in chat as a preview; it is never written to stored content automatically.

## Known limitations

- Roadie has no live database access; it only reasons over the context passed in each request.
- Rate limiting is currently light (input size + validation). A per-IP throttle can be added later.
