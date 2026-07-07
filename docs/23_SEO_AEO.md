# 23 SEO AEO

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



## SEO Requirements
Every public page needs unique title, description, canonical URL, Open Graph, Twitter card, structured data, sitemap inclusion where appropriate, and clean internal links.

## AEO Requirements
Add concise FAQ-style answers on city/category/about/artist pages for AI search engines.

## Artist Pages
Roadie should help generate SEO/AEO, but artist must preview before publishing.

## IndexNow
Publishing or updating public pages should trigger IndexNow placeholder flow.
