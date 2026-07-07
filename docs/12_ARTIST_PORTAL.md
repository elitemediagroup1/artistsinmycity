# 12 Artist Portal

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
The artist portal lets real artists manage their online exhibit.

## Required Navigation
Overview, Analytics, My Gallery, Media, Events, Merch, Tickets, Bookings, Followers, Messages, Roadie AI, Settings, Theme, SEO, Publish, Preview, History, Undo Publish, Restore Previous Version.

## Required Functions
- Edit bio.
- Upload photos, videos, music, and art placeholders.
- Choose layout/theme.
- Add booking/contact links.
- Preview changes before publishing.
- Publish state.
- Undo/restore previous version.
- AI-assisted profile writing, SEO, AEO, captions, and layout suggestions.

## Implementation
For V1, if backend is not connected, use polished local state or preview state. Prepare for Clerk auth, Neon tables, Cloudinary/UploadThing media, Claude/Roadie, GitHub commits, Netlify deploy previews, and Stripe billing.
