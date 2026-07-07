# 20 Loop Architecture

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
All meaningful data feeds EMG LOOP™.

## Event Examples
artist_signed_up, artist_profile_updated, artist_page_published, fan_signed_up, artist_followed, favorite_saved, dm_started, merch_viewed, ticket_clicked, booking_requested, ai_profile_generated, city_page_viewed, category_page_viewed, event_search_performed.

## Flow
ArtistsInMyCity -> Webhook -> EMG LOOP -> Neon.

## Requirement
Every event payload must include timestamp, source, platform, event_type, anonymous_id or user_id when available, city/category context when available, and page URL.
