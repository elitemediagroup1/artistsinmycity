# 21 Database

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



## Decision
Use Neon Postgres. Do not add Supabase.

## Core Tables
users, artists, fan_profiles, creator_profiles, cities, categories, artist_profiles, media_assets, follows, favorites, messages, public_chats, events, tickets, merch_products, orders, bookings, ai_generations, profile_versions, loop_events, audit_logs.

## Auth
Clerk user IDs map to Neon users table.

## Media
Store media in Cloudinary, UploadThing, S3, or R2. Store only metadata/URLs in Neon.
