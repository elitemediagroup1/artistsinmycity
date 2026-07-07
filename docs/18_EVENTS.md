# 18 Events

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
Events page helps fans find creative events by ZIP, city, date, category, and radius.

## Required UI
Ticketmaster-style search experience with filters and event cards.

## Filters
ZIP Code, City, Date, Category, Radius.

## API Placeholders
Ticketmaster Discovery API, Eventbrite API, Bandsintown API, SeatGeek API, optional StubHub.

## Initial State
Show polished “Live event feed coming soon” cards with search UI working visually. Do not invent fake event details.
