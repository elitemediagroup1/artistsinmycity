# 10 City Template

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



## City Page Requirements
Each city has its own subpage.

## Page Sections
- City hero with landmark/creative district photo.
- City description.
- Artist profiles opening soon.
- Local galleries.
- Museums.
- Music venues.
- Public art.
- Open mics.
- Art walks.
- Pop-up markets.
- Creator events.
- Join ArtistsInMyCity CTA.

## Data Rules
Real venues/expos may be represented as generic API-ready cards until feeds are connected. Do not claim fake event times, fake performers, or fake artist profiles.
