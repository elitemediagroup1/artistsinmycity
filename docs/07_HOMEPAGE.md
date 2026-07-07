# 07 Homepage

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



## Required Fixes
The homepage hero must be simplified. Remove clutter and overlay conflicts.

## Hero Requirements
- Cinematic mockup placeholder image.
- Dark gradient overlay for readability.
- Rotating slides every 8 seconds.
- Slides: Artist of the Week — Opening Soon; Sponsored Artist — Reserve this placement; City Spotlight — Opening Soon; Creator Spotlight — Become Featured.
- No fake artists.

## Copy
Headline: DISCOVER. CONNECT. BE INSPIRED.
Subtext: ArtistsInMyCity helps local artists showcase their work through beautiful online exhibits while helping fans discover incredible creativity in every city.

## CTAs
Discover Artists -> /discover
Join as Artist -> /artist-signup

## Search
Directly under hero: keyword, city dropdown, category dropdown, search button.
