# 02 Product Philosophy

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



## Core Philosophy
ArtistsInMyCity should feel less like a directory and more like a living digital arts district.

## Consumer Philosophy
The consumer experience is visual, clean, and discovery-led. It should feel like walking through a modern museum while having the personalization energy of Spotify.

## Artist Philosophy
Every artist page should feel like the artist’s own premium website, not a listing.

## Platform Philosophy
Every meaningful action compounds through EMG LOOP. The platform should learn from signups, follows, searches, city views, category views, event clicks, booking interest, and purchases.
