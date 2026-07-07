# ArtistsInMyCity Product Docs Pack

Upload the /docs folder into the ArtistsInMyCity repository.

Claude should read docs/00_NON_NEGOTIABLES.md first, then the page or feature doc relevant to the task, then docs/prompts/SPRINT_02_CLAUDE_PROMPT.md for the next implementation sprint.


## Analytics & Search Indexing

This project uses Google Analytics 4 (GA4) for analytics and IndexNow for fast
search-engine re-crawling. Both are infrastructure-only and do not affect the UI.

### Google Analytics setup

- Measurement ID: `G-HPSSBYPFLP` (set via `NEXT_PUBLIC_GA_MEASUREMENT_ID`).
- GA4 loads exactly once site-wide from `assets/js/analytics.js`. That single
  utility loads `gtag.js`, sends one `page_view` per page, and self-guards against
  duplicate installs.
- The utility is pulled in on every page through the shared `assets/js/integrations.js`
  loader. The two pages that do not include `integrations.js`
  (`pages/artist-onboarding.html`, `pages/exhibit-builder.html`) reference
  `analytics.js` directly in their `<head>`.
- Never call `gtag()` directly. Use the shared helper instead:

  ```js
  AIMC.trackEvent('artist_signup', { method: 'clerk' });
  // or the named helper
  AIMC.events.artistSignup();
  ```

  All ARTIST / FAN / ROADIE / DISCOVERY events documented in the sprint spec are
  defined as named helpers on `AIMC.events`.

### How to change the GA ID

1. Update `NEXT_PUBLIC_GA_MEASUREMENT_ID` in your environment (Netlify env vars).
2. Update the `GA_MEASUREMENT_ID` constant at the top of `assets/js/analytics.js`.
3. Redeploy. Verify one request to `gtag.js` and one `page_view` in GA Realtime.

### IndexNow verification

- Key: `03517e2645ab42f5bb23cc35147d829a`
- Verification file: `/03517e2645ab42f5bb23cc35147d829a.txt` at the site root. It must return HTTP 200 and
  contain only the key. Live URL:
  `https://artistsinmycity.com/03517e2645ab42f5bb23cc35147d829a.txt`
- The key, key location, and endpoint are configured in `.env.example` and read
  server-side only (never shipped to the browser).
- Submissions go through `services/indexnow.ts` (`submitUrl` / `submitUrls`) which
  delegates to the Netlify function `netlify/functions/indexnow-submit.js`. Publish
  hooks in `services/indexnow.ts` are stubbed (disabled) until the backend is live.

### How to regenerate the IndexNow key

1. Generate a new 8-32 character hex key (e.g. `openssl rand -hex 16`).
2. Create `/<newkey>.txt` at the site root containing only the new key.
3. Update `INDEXNOW_KEY` and `INDEXNOW_KEY_LOCATION` in your environment and in
   `.env.example`.
4. Remove the old key file after search engines pick up the new one.

### How to verify indexing

1. Confirm `https://artistsinmycity.com/03517e2645ab42f5bb23cc35147d829a.txt` returns 200 with the key.
2. Confirm `https://artistsinmycity.com/robots.txt` allows all crawlers and references the sitemap.
3. Confirm `https://artistsinmycity.com/sitemap.xml` is valid and lists all public routes.
4. In Bing Webmaster Tools / Google Search Console, submit the sitemap and check
   the IndexNow / coverage reports over the following days.
