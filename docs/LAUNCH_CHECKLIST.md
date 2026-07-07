# ArtistsInMyCity first-customer launch checklist

This package is clickable and usable in-browser today with local saved demo data. To accept real customers, connect these before launch:

1. Supabase project: Auth + Postgres. Run `docs/SUPABASE_SCHEMA.sql`.
2. Storage: Supabase Storage or Cloudinary for artist photos, music, video, and art uploads.
3. Netlify env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, `GITHUB_REPO`, `NETLIFY_SITE_ID`, `NETLIFY_AUTH_TOKEN`.
4. Claude Netlify function: server-side only. Never expose Anthropic keys in the browser.
5. Payments/commerce: Stripe for merch, tickets, bookings, and featured artist slots.
6. Moderation: require approval before public publish for first cohort.
7. Legal: have privacy/terms reviewed by counsel before real payments, DMs, public chats, or minors are allowed.

Recommended first-customer mode: invite-only artist beta, no public DMs/payments yet, manual approval for every published page.
