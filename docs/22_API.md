# 22 API Integrations

## Required Reading
This document is part of the official ArtistsInMyCity product specification. Any developer or AI agent must preserve the current product direction: Spotify meets MoMA, premium dark creative discovery, no fake artists, no exposed secrets, no Supabase, Neon as database, Clerk placeholders, Claude as Roadie, Stripe payments, GitHub/Netlify deployment, IndexNow, analytics, and EMG LOOP event webhooks.

## Non-Negotiable Implementation Rules
- Do not redesign the project unless explicitly instructed.
- Do not invent fake artist profiles, fake artist names, fake biographies, fake work, or fake quotes.
- If real artist data is not available, use polished states such as “Artist profiles opening soon,” “Sponsored artist slot,” or “Reserve this placement.”
- Every nav item, card CTA, dashboard button, footer link, legal link, and portal action must route somewhere or open a polished preview state.
- Never expose API keys in client code.
- Any AI feature must appear to the user as Roadie, not Claude.
- Every unfinished third-party feature must have complete UI plus integration placeholders.



## Required Placeholders
Clerk, Neon, Claude, Stripe, GitHub API, Netlify Deploy Hooks, EMG LOOP Webhook, IndexNow, GA4, GTM, Microsoft Clarity, Meta Pixel, TikTok Pixel, Cloudinary/UploadThing, Ticketmaster, Eventbrite, Bandsintown, SeatGeek, Mapbox/Google Maps.

## Rule
All secret keys server-side only.

## .env.example Must Include
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, NEON_DATABASE_URL, CLAUDE_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, GITHUB_TOKEN, NETLIFY_BUILD_HOOK_URL, EMG_LOOP_WEBHOOK_URL, INDEXNOW_KEY, NEXT_PUBLIC_GA4_ID, NEXT_PUBLIC_GTM_ID, NEXT_PUBLIC_CLARITY_ID, NEXT_PUBLIC_META_PIXEL_ID, NEXT_PUBLIC_TIKTOK_PIXEL_ID, CLOUDINARY_URL, UPLOADTHING_SECRET, TICKETMASTER_API_KEY, EVENTBRITE_API_KEY, BANDSINTOWN_API_KEY, SEATGEEK_CLIENT_ID, SEATGEEK_CLIENT_SECRET.
