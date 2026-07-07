# 00 Non Negotiables

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



## Purpose
This is the first file every human developer and AI agent must read before editing ArtistsInMyCity.

## Product Identity
ArtistsInMyCity is not a generic directory. It is a living digital arts district where fans discover local creativity and artists build premium online exhibits.

## Absolute Rules
1. No fake artists.
2. No dead links.
3. No generic coming soon pages.
4. No Supabase.
5. Neon is the database.
6. Clerk is the auth placeholder.
7. Claude powers Roadie server-side only.
8. Stripe powers subscriptions, merch, tickets, sponsorship, and featured placements.
9. GitHub and Netlify are used for publishing, deploy previews, and version history.
10. EMG LOOP receives webhook events from all meaningful user behavior.
11. Every city card on /cities must use a landmark or recognizable city-scene photo treatment.
12. The homepage hero must be clean, cinematic, readable, and not cluttered.
13. The footer must include Elite Media Group and Powered by EMG LOOP™.
14. Legal pages must be real pages, not placeholders.
15. Every dashboard must be navigable even when features are preview-only.

## Claude / AI Agent Rule
Claude must implement the specification. Claude must not reinterpret, redesign, rename architecture, or freely invent product behavior. If unclear, preserve what exists and add a TODO comment.
