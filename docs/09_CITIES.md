# 09 Cities

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



## Cities Index Required Behavior
The /cities page must list cities as premium image cards, not plain dark cards.

## City Card Rules
Each card must include a recognizable landmark or city-scene photo style, city name, label, and Explore City CTA. Every card links to its dedicated page.

## Suggested Photo Direction
New York: Manhattan skyline, Brooklyn Bridge, Empire State Building. Los Angeles: palm trees, Hollywood Hills, downtown LA. Miami: Wynwood murals, South Beach, Art Deco. Nashville: Broadway music district. Chicago: Cloud Gate, riverwalk. Austin: murals/live music. Philadelphia: Art Museum steps. Seattle: Space Needle. Boston: harbor/historic streets. Atlanta: BeltLine murals. Denver: skyline and mountains. New Orleans: French Quarter/live music.

## Acceptance
No plain coming-soon city cards remain. No broken city images. Mobile one column, tablet two columns, desktop three columns.
