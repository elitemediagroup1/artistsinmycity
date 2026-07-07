# ArtistsInMyCity Third-Party Setup Checklist

Use this before inviting first real artists. The site includes placeholders for every integration below; replace them in Netlify environment variables, not in frontend code.

## 1. Domain and hosting
- [ ] Add `artistsinmycity.com` to Netlify.
- [ ] Connect the GitHub repository to Netlify.
- [ ] Set production branch to `main`.
- [ ] Confirm SSL certificate is active.
- [ ] Add `www` redirect to apex or apex redirect to `www`.

## 2. Neon database
- [ ] Create Neon project: `artistsinmycity-prod`.
- [ ] Create production database.
- [ ] Copy pooled `DATABASE_URL`.
- [ ] Add `DATABASE_URL` and `NEON_DATABASE_URL` to Netlify.
- [ ] Run `docs/NEON_SCHEMA.sql` in Neon SQL editor.
- [ ] Confirm tables exist: users, artist_profiles, media_assets, follows, favorites, conversations, messages, merch_items, ticketed_events, page_versions, loop_events.

## 3. Clerk authentication
- [ ] Create Clerk application.
- [ ] Enable Email authentication.
- [ ] Add roles/metadata for `artist`, `fan`, `creator`, `admin`.
- [ ] Add redirect URLs: `/dashboard/artist-dashboard.html`, `/dashboard/fan-dashboard.html`, `/dashboard/creator-dashboard.html`, `/dashboard/admin-dashboard.html`.
- [ ] Add `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` to Netlify.
- [ ] Configure Clerk webhook to Netlify function `/api/clerk-webhook`.

## 4. Claude AI Studio
- [ ] Add Anthropic/Claude API key to Netlify as `ANTHROPIC_API_KEY`.
- [ ] Pick model and set `CLAUDE_MODEL`.
- [ ] Test artist prompts: bio, SEO, AEO, captions, page layout, booking CTA.
- [ ] Enforce server-side prompt rules so Claude returns structured JSON changes only when publishing.

## 5. GitHub versioning
- [ ] Create GitHub repo.
- [ ] Create GitHub fine-grained token or GitHub App.
- [ ] Grant repo contents read/write.
- [ ] Add `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH` to Netlify.
- [ ] Test commit on a draft artist profile.
- [ ] Test version history restore.

## 6. Netlify deploy/rollback
- [ ] Add `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`.
- [ ] Create Netlify build hook and add `NETLIFY_DEPLOY_HOOK_URL`.
- [ ] Test Preview Changes flow.
- [ ] Test Publish Page flow.
- [ ] Test Restore Previous Version flow.

## 7. Media storage
Choose one.
- [ ] Cloudinary account and upload preset, or
- [ ] Cloudflare R2/S3 bucket.
- [ ] Add media env variables.
- [ ] Confirm allowed file types: photos, video, audio, documents.
- [ ] Add max upload sizes and moderation rules.

## 8. Stripe
- [ ] Create Stripe products for artist plans.
- [ ] Create product for featured/sponsored slots.
- [ ] Decide whether merch/tickets are Stripe Checkout, Stripe Connect, or external links for V1.
- [ ] Add `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
- [ ] Configure webhook to `/api/stripe-webhook`.
- [ ] Test checkout in Stripe test mode.

## 9. EMG Loop webhook
- [ ] Add `LOOP_WEBHOOK_URL`, `LOOP_WEBHOOK_SECRET`, `LOOP_PLATFORM_ID`.
- [ ] Confirm Loop writes to Neon.
- [ ] Fire test event: `artist_signed_up`.
- [ ] Fire test event: `artist_profile_published`.
- [ ] Fire test event: `fan_followed_artist`.
- [ ] Fire test event: `booking_requested`.

## 10. IndexNow
- [ ] Generate IndexNow key.
- [ ] Upload key file to site root.
- [ ] Add `INDEXNOW_KEY`, `INDEXNOW_KEY_LOCATION`, `INDEXNOW_ENDPOINT`.
- [ ] Submit homepage, city pages, category pages, and first artist pages.

## 11. Analytics and pixels
- [ ] GA4 property. Add `GA4_MEASUREMENT_ID`.
- [ ] Google Tag Manager container. Add `GOOGLE_TAG_MANAGER_ID`.
- [ ] Microsoft Clarity. Add `MICROSOFT_CLARITY_ID`.
- [ ] Meta Pixel. Add `META_PIXEL_ID`.
- [ ] TikTok Pixel. Add `TIKTOK_PIXEL_ID`.
- [ ] Confirm signup, publish, follow, favorite, merch, ticket, and booking events.

## 12. Legal and trust
- [ ] Replace placeholder business/legal contact details.
- [ ] Confirm Terms, Privacy, Cookies, Copyright/DMCA, Safety, Accessibility, Community Guidelines, Content Policy.
- [ ] Add support email.
- [ ] Add artist payout/commerce terms before real merch/tickets.

## 13. First-customer readiness
- [ ] Create one internal test artist.
- [ ] Upload photos/audio/video.
- [ ] Generate bio/SEO/AEO with Claude.
- [ ] Preview page.
- [ ] Publish page.
- [ ] Undo/restore page.
- [ ] Create fan account.
- [ ] Follow artist.
- [ ] Save favorite.
- [ ] Send test DM.
- [ ] Submit booking request.
- [ ] Confirm Loop event log.
- [ ] Confirm analytics events.
