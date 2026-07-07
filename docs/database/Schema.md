# Database Schema Index

## Decision
Use Neon Postgres. Do not add Supabase.

## Core Tables
users, artists, fan_profiles, creator_profiles, cities, categories, artist_profiles, media_assets, follows, favorites, messages, public_chats, events, tickets, merch_products, orders, bookings, ai_generations, profile_versions, loop_events, audit_logs.

## Auth
Clerk user IDs map to Neon users table.

## Media
Store media in Cloudinary, UploadThing, S3, or R2. Store only metadata/URLs in Neon.
