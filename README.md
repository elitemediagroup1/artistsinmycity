# ArtistsInMyCity — Final Customer-Launch Bones

This is the GitHub/Netlify-ready front-end and integration scaffold for **ArtistsInMyCity.com**. It is built as a premium photo-first creative discovery platform with working click-through flows for artists, fans, creators, and admins.

## What is included
- Homepage based on the approved dark, modern, Spotify-meets-MoMA direction.
- Every nav item links to a real page.
- Every major city links to its own city page.
- Every art category links to its own category page.
- No fake artists. Artist slots are marked Coming Soon / Preview Slot.
- Artist signup, artist dashboard, AI Studio, media, booking, analytics, and version history screens.
- Fan signup, fan dashboard, favorites/follows, merch, tickets, DMs, and public chat screens.
- Creator program/dashboard and admin preview.
- Legal pages: Privacy, Terms, Cookies, Accessibility, Community Guidelines, Content Policy, Copyright/DMCA, Safety.
- SEO/AEO basics, sitemap, robots, canonical tags, schema placeholder.
- Original region/category photo-style SVG placeholders in `assets/img/cities/` and `assets/img/categories/`. These are generated placeholders, not copied artist photos.
- Netlify-ready config and API placeholders.
- Environment variable checklist in `.env.example`.
- Neon schema in `docs/NEON_SCHEMA.sql`.
- Manual launch checklist in `docs/THIRD_PARTY_SETUP_CHECKLIST.md`.

## Integrations prepared
- Clerk auth
- Neon Postgres
- Claude / Anthropic AI Studio
- Stripe payments
- GitHub API for versioned publishing
- Netlify deploy previews and rollback
- EMG Loop webhook
- IndexNow
- GA4 / GTM / Clarity / Meta Pixel / TikTok Pixel placeholders
- Cloudinary or R2/S3 media storage placeholders

## Important production note
This package is click-through and browser-functional, but real multi-user production requires adding your third-party keys and wiring the Netlify functions to Neon, Clerk, Stripe, Claude, GitHub, Netlify, and EMG Loop.

Do **not** commit real API keys. Add them inside Netlify environment variables.

## Quick deploy
1. Upload this folder to GitHub.
2. Connect GitHub repo to Netlify.
3. Add environment variables from `.env.example`.
4. Run `docs/NEON_SCHEMA.sql` in Neon.
5. Work through `docs/THIRD_PARTY_SETUP_CHECKLIST.md`.
6. Invite one internal test artist before opening public signup.
